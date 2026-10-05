<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('gateway_expected_amount', 14, 2)->nullable();
            $table->timestamp('gateway_last_checked_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn(['gateway_expected_amount', 'gateway_last_checked_at']));
    }
};
