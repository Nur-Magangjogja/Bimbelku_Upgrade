<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\CustomerWalletService;
use App\Services\FinancialLedgerService;

class OrderObserver
{
    public function updated(Order $order): void
    {
        if (! $order->wasChanged('status')) {
            return;
        }

        $previousStatus = (string) $order->getOriginal('status');
        $currentStatus = (string) $order->status;
        $wallets = app(CustomerWalletService::class);
        $ledger = app(FinancialLedgerService::class);

        if (in_array($currentStatus, ['rejected', 'cancelled', 'expired'], true)) {
            $wallets->releaseReserved($order, null, "order_status:{$currentStatus}");

            return;
        }

        if ($currentStatus === 'paid') {
            $wallets->captureReserved($order);
            $ledger->recordPaymentReceived($order->fresh());

            return;
        }

        if ($currentStatus === 'refund_pending') {
            if ($order->payment_reconciliation_status === 'late_payment_refund') {
                $ledger->recordLateGatewayPaymentReceived($order->fresh());

                return;
            }
            if (! in_array($previousStatus, ['paid', 'refund_pending', 'refunded'], true)) {
                $wallets->captureReserved($order);
                $ledger->recordPaymentReceived($order->fresh());
            }
            if ($order->refund) {
                $ledger->recordRefundQueued($order->refund);
            }
        }
    }
}
