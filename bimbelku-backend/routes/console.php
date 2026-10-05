<?php

use App\Models\Refund;
use App\Services\RefundSettlementService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('refunds:reconcile', function (RefundSettlementService $settlement) {
    Refund::query()
        ->where('status', 'pending')
        ->where('destination_method', 'xendit_original')
        ->where(fn ($query) => $query->whereNull('last_reconciled_at')->orWhere('last_reconciled_at', '<=', now()->subMinutes(5)))
        ->orderBy('id')
        ->chunkById(100, fn ($refunds) => $refunds->each(function (Refund $refund) use ($settlement) {
            if (! $settlement->isAutomatic($refund)) {
                return;
            }
            if (blank($refund->gateway_refund_id)) {
                $settlement->startAutomatic($refund);

                return;
            }
            $settlement->reconcile($refund);
        }));
})->purpose('Reconcile pending automatic refunds with the payment provider');

Schedule::command('payments:reconcile')
    ->everyMinute()
    ->runInBackground()
    ->withoutOverlapping(10);

Schedule::command('bookings:expire')
    ->everyMinute()
    ->withoutOverlapping(5);

Schedule::command('guest-packages:expire')
    ->everyFiveMinutes()
    ->withoutOverlapping(5);

Schedule::command('finance:verify-ledger')
    ->dailyAt('02:00')
    ->withoutOverlapping(30);
Schedule::command('refunds:reconcile')
    ->everyFiveMinutes()
    ->withoutOverlapping(10);
Schedule::command('sanctum:prune-expired --hours=24')
    ->dailyAt('03:00')
    ->withoutOverlapping(30);
