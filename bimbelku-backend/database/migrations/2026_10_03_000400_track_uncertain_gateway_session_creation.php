<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', fn (Blueprint $table) => $table->boolean('gateway_creation_uncertain')->default(false));
        // The old code treated even HTTP 500 as SESSION_FAILED. Do not assume
        // these legacy attempts are safe to repeat without provider evidence.
        DB::table('orders')->whereIn('gateway_status', ['CREATING', 'SESSION_FAILED'])
            ->whereNotNull('gateway_reference_id')->whereNull('gateway_session_id')
            ->update(['gateway_creation_uncertain' => true]);
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn('gateway_creation_uncertain'));
    }
};
