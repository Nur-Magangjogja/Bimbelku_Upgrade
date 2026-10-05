<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\GatewayPaymentSettlementService;
use App\Services\XenditPaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReconcileGatewayPayments extends Command
{
    protected $signature = 'payments:reconcile';

    protected $description = 'Memeriksa pembayaran ketika webhook belum diterima, tanpa bergantung pada browser';

    public function handle(XenditPaymentService $gateway, GatewayPaymentSettlementService $settlement): int
    {
        if (! $gateway->configured()) {
            return self::SUCCESS;
        }
        $startedAt = microtime(true);
        $checked = 0;
        $failed = 0;
        Order::query()->whereNotNull('gateway_session_id')
            ->whereIn('status', ['pending', 'rejected', 'partially_paid', 'submitted', 'expired', 'cancelled'])
            // Keep checking recently closed sessions for delayed payments.
            // Older receipts remain handled by authenticated webhooks.
            ->where(fn ($query) => $query->whereNotIn('status', ['expired', 'cancelled'])
                ->orWhere('updated_at', '>=', now()->subDays(7)))
            ->where(fn ($query) => $query->whereNull('gateway_last_checked_at')
                ->orWhere('gateway_last_checked_at', '<=', now()->subMinutes(5)))
            ->orderBy('gateway_last_checked_at')->orderBy('id')->limit(20)->get()
            ->each(function (Order $order) use ($gateway, $settlement, &$checked, &$failed, $startedAt) {
                if (microtime(true) - $startedAt >= 45) {
                    return false;
                }
                try {
                    $data = $gateway->fetchSession($order);
                    if (in_array(strtoupper((string) ($data['status'] ?? '')), ['COMPLETED', 'SUCCEEDED', 'PAID', 'CAPTURED'], true)) {
                        $settlement->settle($order, $data);
                    }
                    $checked++;
                } catch (\Throwable $exception) {
                    report($exception);
                    $failed++;
                } finally {
                    // Query update avoids moving updated_at and accidentally
                    // extending the seven-day retry window of closed orders.
                    DB::table('orders')->where('id', $order->id)
                        ->update(['gateway_last_checked_at' => now()]);
                }
            });
        $this->info("Pembayaran diperiksa: {$checked}; perlu dicoba kembali: {$failed}.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
