<?php

declare(strict_types=1);

// Preparation only: no seeding, payment creation, settlement, or lifecycle jobs.
// Optional --gateway-status performs one GET for an existing demo sandbox session.
require __DIR__.'/../bimbelku-backend/vendor/autoload.php';
$app = require __DIR__.'/../bimbelku-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

$developmentKey = str_starts_with((string) config('xendit.secret_key'), 'xnd_development_');
$report = [
    'checked_at' => now()->toIso8601String(),
    'environment' => app()->environment(),
    'database_driver' => config('database.default'),
    'config_cached' => app()->configurationIsCached(),
    'auth' => [
        'google_client_id_present' => filled(config('services.google.client_id')),
        'google_client_secret_present' => filled(config('services.google.client_secret')),
        'google_callback_is_loopback' => in_array(parse_url((string) config('services.google.redirect'), PHP_URL_HOST), ['localhost', '127.0.0.1'], true),
        'oauth_browser_login' => 'not_tested',
    ],
    'mail_driver' => config('mail.default'),
    'queue_driver' => config('queue.default'),
    'payment' => [
        'enabled' => (bool) config('xendit.enabled'),
        'development_key_present' => $developmentKey,
        'webhook_token_present' => filled(config('xendit.webhook_token')),
        'success_return_is_loopback' => in_array(parse_url((string) config('xendit.success_url'), PHP_URL_HOST), ['localhost', '127.0.0.1'], true),
        'cancel_return_is_loopback' => in_array(parse_url((string) config('xendit.cancel_url'), PHP_URL_HOST), ['localhost', '127.0.0.1'], true),
        'remote_readonly_check' => 'not_requested',
        'webhook_delivery' => 'not_tested',
        'embedded_https_browser' => 'not_tested',
    ],
    'bank_name_verifier_available' => app(App\Services\BankAccountNameVerifier::class)->available(),
    'database' => ['connected' => false],
    'demo_accounts' => [],
    'warnings' => [],
];

if (! app()->environment(['local', 'testing'])) {
    $report['warnings'][] = 'Audit refuses database/network inspection outside local/testing.';
    echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL;
    exit(2);
}

$demoSessionId = null;
$transactionStarted = false;
try {
    $connection = DB::connection();
    $connection->getPdo();
    if ($connection->getDriverName() === 'mysql') {
        // MySQL rejects ordinary INSERT/UPDATE/DELETE in this audit transaction.
        $connection->statement('SET TRANSACTION READ ONLY');
    }
    $connection->beginTransaction();
    $transactionStarted = true;
    $report['database']['connected'] = true;
    $report['database']['transaction'] = $connection->getDriverName() === 'mysql' ? 'read_only' : 'rollback_only';

    $applied = Schema::hasTable('migrations') ? DB::table('migrations')->pluck('migration')->all() : [];
    $migrationNames = array_map(static fn (string $file): string => basename($file, '.php'), glob(__DIR__.'/../bimbelku-backend/database/migrations/*.php') ?: []);
    $report['database']['pending_migrations'] = array_values(array_diff($migrationNames, $applied));

    foreach (['users', 'learning_packages', 'orders', 'bookings', 'refunds', 'payouts'] as $table) {
        $report['database']['rows'][$table] = Schema::hasTable($table) ? DB::table($table)->count() : null;
    }

    if (Schema::hasTable('users')) {
        $report['database']['active_users_by_role'] = DB::table('users')->whereNull('deleted_at')
            ->where('status', 'active')->select('role')->selectRaw('COUNT(*) AS total')->groupBy('role')->pluck('total', 'role')->all();
        $accounts = DB::table('users')->whereNull('deleted_at')
            ->where(function ($query) {
                $query->where('email', 'like', 'demo.%@bimbelku.local')
                    ->orWhere('email', 'azrilguru@gmail.com');
            })->orderBy('email')->get(['id', 'email', 'role', 'status', 'email_verified_at']);
        foreach ($accounts as $account) {
            $entry = [
                'email' => $account->email,
                'role' => $account->role,
                'status' => $account->status,
                'email_verified' => $account->email_verified_at !== null,
            ];
            if ($account->role === 'teacher' && Schema::hasTable('teacher_profiles')) {
                $profile = DB::table('teacher_profiles')->where('user_id', $account->id)->first(['id', 'verified_at', 'is_accepting_requests']);
                $entry['teacher_verified'] = $profile?->verified_at !== null;
                $entry['accepting_requests'] = (bool) $profile?->is_accepting_requests;
                $entry['active_subjects'] = $profile && Schema::hasTable('teacher_subjects')
                    ? DB::table('teacher_subjects')->where('teacher_profile_id', $profile->id)->where('is_active', true)->count() : 0;
                $entry['subject_names'] = $profile && Schema::hasTable('teacher_subjects')
                    ? DB::table('teacher_subjects')->where('teacher_profile_id', $profile->id)->where('is_active', true)->pluck('name')->all() : [];
                $entry['active_availability_rows'] = Schema::hasTable('teacher_availabilities')
                    ? DB::table('teacher_availabilities')->where('user_id', $account->id)->where('is_active', true)->count() : 0;
            }
            $report['demo_accounts'][] = $entry;
        }
    }

    foreach (['package_plans', 'curriculum_subjects', 'learning_programs', 'learning_time_slots'] as $table) {
        $report['catalog'][$table] = Schema::hasTable($table) ? DB::table($table)->count() : null;
    }
    if (Schema::hasTable('orders')) {
        $demoSessionId = DB::table('orders')->where('order_id', 'like', 'DEMO-XENDIT-%')
            ->where('payment_provider', 'xendit')->whereNotNull('gateway_session_id')
            ->orderByDesc('id')->value('gateway_session_id');
        $report['payment']['existing_connectivity_demo_present'] = $demoSessionId !== null;
    }
} catch (Throwable $exception) {
    // No raw SQL, connection credentials, gateway responses, or stack traces.
    $report['warnings'][] = 'Database inspection failed ('.get_class($exception).'); no application data changed.';
} finally {
    if ($transactionStarted) DB::connection()->rollBack();
}

if (in_array('--gateway-status', $argv, true)) {
    $baseUrl = (string) config('xendit.base_url');
    if (! $developmentKey || ! config('xendit.enabled') || ! filled(config('xendit.webhook_token'))) {
        $report['payment']['remote_readonly_check'] = 'blocked_configuration';
    } elseif (parse_url($baseUrl, PHP_URL_SCHEME) !== 'https' || parse_url($baseUrl, PHP_URL_HOST) !== 'api.xendit.co') {
        $report['payment']['remote_readonly_check'] = 'blocked_untrusted_endpoint';
    } elseif (! is_string($demoSessionId) || $demoSessionId === '') {
        $report['payment']['remote_readonly_check'] = 'no_existing_demo_session';
    } else {
        try {
            $response = Http::withBasicAuth((string) config('xendit.secret_key'), '')
                ->acceptJson()->connectTimeout(5)->timeout(15)
                ->get(rtrim($baseUrl, '/').'/sessions/'.rawurlencode($demoSessionId));
            $report['payment']['remote_readonly_http_status'] = $response->status();
            $status = $response->json('status');
            $validStatus = is_string($status) && preg_match('/^[A-Z_]{2,40}$/D', $status) === 1;
            $report['payment']['remote_readonly_check'] = $response->successful() && $validStatus ? 'passed' : 'failed';
            if ($response->successful() && $validStatus) $report['payment']['existing_demo_remote_status'] = $status;
        } catch (Throwable) {
            $report['payment']['remote_readonly_check'] = 'network_failed';
        }
    }
}

if (! $report['bank_name_verifier_available']) {
    $report['warnings'][] = 'BankAccountNameVerifier currently returns false; real withdrawal cannot pass name verification.';
}
echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL;
exit($report['database']['connected'] && ($report['database']['pending_migrations'] ?? []) === [] ? 0 : 1);
