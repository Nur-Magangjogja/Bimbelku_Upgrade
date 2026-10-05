<?php

namespace App\Services;

use App\Models\CustomerWalletTransaction;
use App\Models\Notification;
use App\Models\Order;
use App\Models\PromotionClaim;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RefundSettlementService
{
    public function __construct(
        private readonly CustomerWalletService $wallets,
        private readonly PartialPackageRefundService $partialPackageRefunds,
        private readonly XenditMoneyMovementService $gateway,
    ) {}

    public function isAutomatic(Refund $refund): bool
    {
        return in_array($refund->source_type, ['teacher_replacement', 'late_gateway_payment'], true)
            || in_array(mb_strtolower(trim((string) $refund->reason)), [
                'tutor tidak ditemukan',
                'paket dibatalkan murid saat pencarian tutor',
            ], true);
    }

    public function startAutomatic(Refund $refund): bool
    {
        $refund->refresh()->loadMissing('order');
        if (! $this->isAutomatic($refund)) {
            return false;
        }
        if ($refund->status === 'paid') {
            return true;
        }
        if ($refund->status !== 'pending') {
            return false;
        }
        if (! $refund->destination_selected_at) {
            return false;
        }

        if ($refund->destination_method === 'bimbelku_balance') {
            $this->settle($refund, 'bimbelku_balance');

            return true;
        }
        if ($refund->destination_method !== 'xendit_original') {
            return false;
        }

        $breakdown = $refund->tenderBreakdown();
        if ($breakdown['external_funded_amount'] <= 0.009) {
            $this->settle($refund, 'bimbelku_balance');

            return true;
        }
        if ($refund->order?->payment_provider !== 'xendit') {
            $this->notifyManualReview($refund);

            return false;
        }

        try {
            if ($refund->source_type === 'late_gateway_payment' && blank($refund->order->gateway_payment_request_id)) {
                // Some completion callbacks omit the original payment request.
                // Recover it server-to-server, including on scheduled retries.
                $session = app(XenditPaymentService::class)->fetchSession($refund->order);
                $refund->order->forceFill([
                    'gateway_payment_request_id' => $session['payment_request_id'] ?? data_get($session, 'payment_request.id'),
                    'gateway_payment_id' => $session['payment_id'] ?? data_get($session, 'payment.id') ?? $refund->order->gateway_payment_id,
                ])->save();
            }
            $this->gateway->createRefund($refund);
        } catch (\Throwable $exception) {
            report($exception);
            $this->notifyManualReview($refund);

            return false;
        }
        $refund->refresh();
        if (in_array($refund->gateway_status, ['FAILED', 'REJECTED'], true) || blank($refund->gateway_refund_id)) {
            $this->notifyManualReview($refund);

            return false;
        }
        if ($refund->gateway_status === 'SUCCEEDED') {
            $this->settle($refund, 'xendit_original');
        }

        return true;
    }

    public function notifyManualReview(Refund $refund): void
    {
        Notification::firstOrCreate(['unique_key' => "refund-manual:{$refund->id}"], [
            'user_id' => $refund->user_id,
            'title' => 'Refund perlu bantuan',
            'message' => 'Pengembalian dana perlu ditangani tim BimbelKu.',
            'type' => 'warning',
            'target_url' => '/student/history',
        ]);
        User::query()->where('role', 'admin')->pluck('id')->each(fn (int $adminId) => Notification::firstOrCreate(['unique_key' => "refund-review:{$refund->id}:{$adminId}"], [
            'user_id' => $adminId,
            'title' => 'Refund perlu ditangani',
            'message' => "Refund {$refund->refund_code} memerlukan penanganan manual.",
            'type' => 'warning',
            'target_url' => '/admin/finance?tab=refunds',
        ])
        );
    }

    public function reconcile(Refund $refund): bool
    {
        $refund->refresh()->loadMissing('order');
        if ($refund->status === 'paid') {
            return true;
        }
        if ($refund->status !== 'pending' || $refund->destination_method !== 'xendit_original') {
            return false;
        }

        try {
            $this->gateway->retrieveRefund($refund);
        } catch (\Throwable $exception) {
            report($exception);
            $isStale = ($refund->gateway_submitted_at ?: $refund->created_at)?->lt(now()->subDay());
            $refund->forceFill(['last_reconciled_at' => now()])->save();
            if ($isStale) {
                $this->notifyManualReview($refund);
            }

            return false;
        }

        $refund->refresh();
        if ($refund->gateway_status === 'SUCCEEDED') {
            $this->settle($refund, 'xendit_original');

            return true;
        }
        if (in_array($refund->gateway_status, ['FAILED', 'REJECTED'], true)) {
            $this->notifyManualReview($refund);

            return false;
        }
        if (($refund->gateway_submitted_at ?: $refund->created_at)?->lt(now()->subDay())) {
            $this->notifyManualReview($refund);
        }

        return true;
    }

    /** @return array{refund:Refund,wallet_transaction:?CustomerWalletTransaction,breakdown:array} */
    public function settle(
        Refund $refund,
        string $destinationMethod,
        ?int $actorId = null,
        ?string $proof = null,
        ?string $notes = null
    ): array {
        $walletTransaction = null;
        $breakdown = [];

        DB::transaction(function () use ($refund, $destinationMethod, $actorId, $proof, $notes, &$walletTransaction, &$breakdown) {
            $locked = Refund::query()->with([
                'order.participant.bookingRequest', 'order.cheapClassEnrollment', 'booking',
            ])->lockForUpdate()->findOrFail($refund->id);

            if ($locked->status === 'paid') {
                return;
            }
            abort_unless($locked->status === 'pending', 422, 'Refund ini sudah tidak dapat diproses.');
            abort_unless(in_array($destinationMethod, ['xendit_original', 'bank_transfer', 'bimbelku_balance'], true), 422, 'Tujuan refund tidak valid.');

            $breakdown = $locked->tenderBreakdown();
            if ($destinationMethod === 'xendit_original') {
                abort_if($breakdown['external_funded_amount'] <= 0.009, 422, 'Refund ini tidak memiliki dana eksternal.');
                abort_unless($locked->gateway_status === 'SUCCEEDED', 409, 'Refund otomatis belum berhasil.');
                if ($breakdown['wallet_funded_amount'] > 0.009) {
                    $walletTransaction = $this->wallets->creditRefund($locked, $actorId, $breakdown['wallet_funded_amount']);
                }
            } elseif ($destinationMethod === 'bimbelku_balance') {
                $walletTransaction = $this->wallets->creditRefund($locked, $actorId);
            } else {
                abort_if($breakdown['external_funded_amount'] <= 0.009 || ! $proof, 422, 'Bukti transfer refund wajib tersedia.');
                if ($breakdown['wallet_funded_amount'] > 0.009) {
                    $walletTransaction = $this->wallets->creditRefund($locked, $actorId, $breakdown['wallet_funded_amount']);
                }
            }

            $locked->update([
                'status' => 'paid',
                'destination_method' => $destinationMethod,
                'destination_selected_at' => $locked->destination_selected_at ?: now(),
                'proof' => $proof,
                'processed_by' => $actorId,
                'processed_at' => now(),
                'notes' => $notes,
                'gateway_processed_at' => $destinationMethod === 'xendit_original' ? now() : $locked->gateway_processed_at,
            ]);

            if ($locked->source_type !== 'teacher_replacement') {
                $locked->order->update(['status' => 'refunded']);
                $this->restorePromotionClaim($locked->order, (string) $locked->reason);
                $locked->order->participant?->update(['status' => 'refunded']);
                $locked->order->participant?->bookingRequest?->update(['status' => 'refunded']);
                $locked->order->cheapClassEnrollment?->update(['status' => 'refunded']);
                if ($locked->source_type === 'late_gateway_payment') {
                    $locked->order->learningPackage?->update(['status' => 'refunded']);
                    $locked->order->learningPackage?->subjects()->update(['status' => 'refunded']);
                }
            } else {
                $this->partialPackageRefunds->completeTeacherReplacementRefund($locked->fresh());
            }

            $remaining = $locked->booking?->refunds()->where('status', 'pending')->count() ?? 0;
            if ($locked->booking && $remaining === 0) {
                $settled = ['approved', 'no_show_confirmed', 'refunded', 'cancelled', 'teacher_rejected'];
                $unsettled = $locked->booking->participants()->whereNotIn('status', $settled)->exists();
                $earning = $locked->booking->participants()->whereIn('status', ['approved', 'no_show_confirmed'])->count();
                $gross = $earning * (float) $locked->booking->total_amount;
                $net = round($gross * (100 - (float) $locked->booking->commission_percent) / 100);
                $locked->booking->update([
                    'status' => $unsettled ? 'partially_refunded' : ($earning > 0 ? 'completed' : 'refunded'),
                    'gross_amount' => $gross,
                    'teacher_net_amount' => $net,
                    'payout_status' => $unsettled ? 'locked' : ($earning > 0 ? 'ready' : 'cancelled'),
                ]);
            }

            $message = match ($destinationMethod) {
                'bimbelku_balance' => 'Refund sudah masuk ke Saldo BimbelKu.',
                'xendit_original' => 'Refund eksternal berhasil dikembalikan otomatis ke metode pembayaran asal.'.($breakdown['wallet_funded_amount'] > 0.009 ? ' Bagian Saldo BimbelKu juga sudah dikembalikan ke saldo.' : ''),
                default => 'Refund lama telah dicatat selesai.',
            };
            Notification::create([
                'user_id' => $locked->user_id,
                'title' => $destinationMethod === 'bimbelku_balance' ? 'Refund masuk ke Saldo BimbelKu' : 'Refund selesai',
                'message' => $message,
                'type' => 'success',
                'target_url' => '/student/history',
                'unique_key' => "refund-completed:{$locked->id}",
            ]);
        }, 3);

        return ['refund' => $refund->fresh(), 'wallet_transaction' => $walletTransaction, 'breakdown' => $breakdown ?: $refund->tenderBreakdown()];
    }

    private function restorePromotionClaim(Order $order, string $reason): void
    {
        if (! in_array(mb_strtolower(trim($reason)), ['keadaan darurat tutor', 'keberatan murid disetujui', 'tutor tidak hadir'], true) || ! $order->learning_package_id) {
            return;
        }
        PromotionClaim::query()->where('order_id', $order->id)->where('status', 'used')->update([
            'status' => 'available', 'order_id' => null, 'learning_package_id' => null,
            'used_at' => null, 'released_at' => now(),
        ]);
    }
}
