<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentGatewayEvent;
use App\Services\CheapClassService;
use App\Services\GatewayPaymentSettlementService;
use App\Services\PackageCheckoutService;
use App\Services\XenditPaymentService;
use App\Services\XenditWebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class XenditPaymentController extends Controller
{
    public function createSession(Request $request, Order $order, XenditPaymentService $xendit)
    {
        $validated = $request->validate(['mode' => 'sometimes|in:components,payment_link']);
        abort_unless((int) $order->user_id === (int) $request->user()->id, 403);
        abort_unless(in_array($order->status, ['pending', 'rejected', 'partially_paid'], true), 422, 'Tagihan ini sudah tidak dapat dibayar.');
        abort_if($order->learningPackage?->payment_due_at && ! $order->learningPackage->payment_due_at->isFuture(), 422, 'Batas pembayaran paket sudah berakhir.');
        abort_if($order->cheapClassEnrollment?->seat_expires_at && ! $order->cheapClassEnrollment->seat_expires_at->isFuture(), 422, 'Batas pembayaran kursi sudah berakhir.');

        try {
            $mode = ($validated['mode'] ?? 'payment_link') === 'components' ? 'COMPONENTS' : 'PAYMENT_LINK';

            return response()->json(['data' => $xendit->createSession($order, $request->user(), $mode, $request->header('Origin'))])
                ->header('Cache-Control', 'no-store');
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => $xendit->configured() ? 'xendit_unavailable' : 'xendit_not_configured',
            ], $xendit->configured() ? 502 : 503);
        }
    }

    public function sync(
        Request $request,
        Order $order,
        PackageCheckoutService $packages,
        CheapClassService $cheapClasses,
        XenditPaymentService $xendit
    ) {
        abort_unless((int) $order->user_id === (int) $request->user()->id, 403);

        if (blank($order->gateway_session_id) || $order->status === 'paid') {
            return response()->json([
                'status' => $order->status,
                'gateway_status' => $order->gateway_status,
            ]);
        }

        try {
            $data = $xendit->fetchSession($order);
            $status = strtoupper((string) Arr::get($data, 'status', ''));
            $successful = in_array($status, ['COMPLETED', 'SUCCEEDED', 'PAID', 'CAPTURED'], true);

            if ($successful) {
                app(GatewayPaymentSettlementService::class)->settle($order, $data);
            } else {
                $xendit->recordSessionStatus($order, $status, $data);
            }

            $fresh = $order->fresh();

            return response()->json([
                'status' => $fresh->status,
                'gateway_status' => $fresh->gateway_status,
                'gateway_paid_at' => $fresh->gateway_paid_at,
            ]);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 502);
        }
    }

    public function webhook(
        Request $request,
        PackageCheckoutService $packages,
        CheapClassService $cheapClasses,
        XenditPaymentService $xendit,
        XenditWebhookService $moneyWebhooks
    ) {
        $configuredToken = (string) config('xendit.webhook_token');
        $receivedToken = (string) $request->header('x-callback-token', '');
        abort_if($configuredToken === '' || ! hash_equals($configuredToken, $receivedToken), 401, 'Webhook token tidak valid.');

        $payload = $request->all();
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : $payload;
        $eventType = strtolower((string) ($payload['event'] ?? $payload['event_type'] ?? 'unknown'));
        $eventId = (string) ($payload['id'] ?? $payload['event_id'] ?? $request->header('webhook-id', ''));
        if ($eventId === '') {
            $eventId = 'hash-'.hash('sha256', $request->getContent());
        }

        if (str_starts_with($eventType, 'refund.') || str_starts_with($eventType, 'v3_payout.')) {
            $moneyWebhooks->handle($eventType, $eventId, $payload, $data);

            return response()->json(['received' => true]);
        }

        $sessionId = Arr::get($data, 'payment_session_id')
            ?? Arr::get($data, 'session_id')
            ?? Arr::get($data, 'payment_session.id');
        $reference = Arr::get($data, 'reference_id')
            ?? Arr::get($data, 'payment_session.reference_id');
        $orderId = Arr::get($data, 'metadata.order_id')
            ?? Arr::get($data, 'payment_session.metadata.order_id');

        $validSession = $sessionId === null || (is_string($sessionId) && trim($sessionId) !== '' && strlen($sessionId) <= 128);
        $validReference = $reference === null || (is_string($reference) && trim($reference) !== '' && strlen($reference) <= 128);
        $validOrderId = $orderId === null || ((is_string($orderId) || is_int($orderId)) && ctype_digit((string) $orderId) && (int) $orderId > 0);
        $identityError = null;
        $order = null;
        if (! $validSession || ! $validReference || ! $validOrderId) {
            $identityError = 'Identitas transaksi webhook tidak valid.';
        } elseif (! $sessionId && ! $reference) {
            // A metadata order ID alone is not a payment-session identity.
            // Never run an unfiltered first() when identifiers are missing.
            $identityError = 'Webhook tidak memiliki ID sesi atau referensi checkout.';
        } else {
            $order = Order::query()
                ->when($reference, fn ($query) => $query->where('gateway_reference_id', $reference))
                ->when($sessionId, fn ($query) => $query->where(function ($sessions) use ($sessionId, $reference) {
                    $sessions->where('gateway_session_id', $sessionId);
                    if ($reference) {
                        // An authenticated callback can recover a session whose
                        // create response was lost, but only by its saved ref.
                        $sessions->orWhere(fn ($unknown) => $unknown->whereNull('gateway_session_id')->where('gateway_creation_uncertain', true));
                    }
                }))
                ->when($orderId, fn ($query) => $query->whereKey($orderId))
                ->first();
            if (! $order) {
                $identityError = 'Identitas webhook tidak cocok dengan checkout tagihan.';
            }
        }

        $event = PaymentGatewayEvent::firstOrCreate(
            ['event_id' => 'xendit:'.$eventId],
            [
                'provider' => 'xendit',
                'event_type' => $eventType,
                'order_id' => $order?->id,
                'payload' => $payload,
                'status' => 'received',
            ]
        );
        if (! $event->wasRecentlyCreated && $event->status === 'processed') {
            return response()->json(['received' => true]);
        }
        if (! $order) {
            $event->update(['status' => 'ignored', 'error' => $identityError ?? 'Order tidak ditemukan', 'processed_at' => now()]);

            return response()->json(['received' => true], 202);
        }

        $status = strtoupper((string) (Arr::get($data, 'status') ?? Arr::get($data, 'payment_session.status') ?? ''));
        $successful = in_array($eventType, ['payment_session.completed', 'payment.succeeded', 'payment.capture', 'payment.capture.succeeded'], true)
            || in_array($status, ['COMPLETED', 'SUCCEEDED', 'PAID', 'CAPTURED'], true);

        if (! $successful) {
            $gatewayStatus = in_array($status, ['EXPIRED', 'CANCELED', 'CANCELLED', 'FAILED'], true) ? $status : ($status ?: 'EVENT_RECEIVED');
            $updated = $xendit->recordSessionStatus($order, $gatewayStatus, $data);
            $event->update(['status' => $updated ? 'processed' : 'ignored', 'processed_at' => now(),
                'error' => $updated ? null : 'Notifikasi lama/status nonfinal tidak boleh menimpa status checkout atau penerimaan dana.']);

            return response()->json(['received' => true]);
        }

        $paidAmount = $this->paidAmount($data);
        if ($paidAmount <= 0 && filled($order->gateway_session_id)) {
            // Some completion notifications omit the amount. Verify the session
            // server-to-server before accepting it instead of trusting a blank value.
            $verified = $xendit->fetchSession($order);
            if (! in_array(strtoupper((string) ($verified['status'] ?? '')), ['COMPLETED', 'SUCCEEDED', 'PAID', 'CAPTURED'], true)) {
                $event->update(['status' => 'failed', 'error' => 'Gateway belum mengonfirmasi pembayaran berhasil.']);

                return response()->json(['received' => true], 202);
            }
            $data = array_replace_recursive($data, $verified);
            $paidAmount = $this->paidAmount($data);
        }
        $expectedAmount = $order->gateway_expected_amount ?? $xendit->externalDue($order);
        if (in_array($order->status, ['expired', 'cancelled'], true) && $order->gateway_expected_amount === null && $paidAmount <= (float) $order->amount) {
            $expectedAmount = $paidAmount;
        }
        // A repeated success must not fail validation merely because the first
        // delivery already consumed the outstanding balance.
        if (in_array($order->status, ['paid', 'refund_pending', 'refunded'], true) && $order->gateway_status === 'COMPLETED') {
            app(GatewayPaymentSettlementService::class)->settle($order, $data);
            $event->update(['status' => 'processed', 'processed_at' => now()]);

            return response()->json(['received' => true]);
        }
        if ($paidAmount <= 0 || ($order->status !== 'submitted' && abs($paidAmount - $expectedAmount) > 0.009)) {
            $event->update(['status' => 'failed', 'error' => 'Nominal webhook tidak sama dengan tagihan.']);

            return response()->json(['received' => true], 202);
        }

        try {
            app(GatewayPaymentSettlementService::class)->settle($order, $data);
            $event->update(['order_id' => $order->id, 'status' => 'processed', 'error' => null, 'processed_at' => now()]);
        } catch (Throwable $exception) {
            $event->update(['status' => 'failed', 'error' => Str::limit($exception->getMessage(), 1500)]);
            throw $exception;
        }

        return response()->json(['received' => true]);
    }

    private function paidAmount(array $data): float
    {
        return (float) (Arr::get($data, 'amount')
            ?? Arr::get($data, 'payment_details.amount')
            ?? Arr::get($data, 'payment.amount')
            ?? 0);
    }
}
