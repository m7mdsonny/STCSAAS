<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LicenseController;
use App\Http\Controllers\EdgeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\BrandingController;
use App\Http\Controllers\PlatformContentController;
use App\Http\Controllers\NotificationPriorityController;
use App\Http\Controllers\SmsQuotaController;
use App\Http\Controllers\SystemBackupController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AiPolicyController;
use App\Http\Controllers\UpdateAnnouncementController;
use App\Http\Controllers\PublicContentController;
use App\Http\Controllers\AiCommandController;

Route::prefix('v1')->group(function () {
    Route::get('/public/landing', [PublicContentController::class, 'landing']);
    Route::get('/public/updates', [UpdateAnnouncementController::class, 'publicIndex']);
    Route::get('/branding', [BrandingController::class, 'showPublic']);

    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'changePassword']);

        Route::post('/licensing/validate', [LicenseController::class, 'validateKey']);
        Route::post('/edges/heartbeat', [EdgeController::class, 'heartbeat']);
        Route::post('/edges/events', [EventController::class, 'ingest']);
        Route::get('/notifications', [NotificationController::class, 'index']);

        Route::get('/dashboard/admin', [DashboardController::class, 'admin']);

        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
        Route::put('/organizations/{organization}', [OrganizationController::class, 'update']);
        Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy']);
        Route::post('/organizations/{organization}/toggle-active', [OrganizationController::class, 'toggleActive']);
        Route::put('/organizations/{organization}/plan', [OrganizationController::class, 'updatePlan']);
        Route::get('/organizations/{organization}/stats', [OrganizationController::class, 'stats']);
        Route::post('/organizations/{organization}/sms-quota/consume', [SmsQuotaController::class, 'consume']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        Route::get('/licenses', [LicenseController::class, 'index']);
        Route::post('/licenses', [LicenseController::class, 'store']);
        Route::get('/licenses/{license}', [LicenseController::class, 'show']);
        Route::put('/licenses/{license}', [LicenseController::class, 'update']);
        Route::delete('/licenses/{license}', [LicenseController::class, 'destroy']);
        Route::post('/licenses/{license}/activate', [LicenseController::class, 'activate']);
        Route::post('/licenses/{license}/suspend', [LicenseController::class, 'suspend']);
        Route::post('/licenses/{license}/renew', [LicenseController::class, 'renew']);
        Route::post('/licenses/{license}/regenerate-key', [LicenseController::class, 'regenerateKey']);

        Route::get('/subscription-plans', [SubscriptionPlanController::class, 'index']);
        Route::post('/subscription-plans', [SubscriptionPlanController::class, 'store']);
        Route::get('/subscription-plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'show']);
        Route::put('/subscription-plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'update']);
        Route::delete('/subscription-plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'destroy']);

        Route::get('/edge-servers', [EdgeController::class, 'index']);
        Route::post('/edge-servers', [EdgeController::class, 'store']);
        Route::get('/edge-servers/{edgeServer}', [EdgeController::class, 'show']);
        Route::put('/edge-servers/{edgeServer}', [EdgeController::class, 'update']);
        Route::delete('/edge-servers/{edgeServer}', [EdgeController::class, 'destroy']);
        Route::get('/edge-servers/{edgeServer}/logs', [EdgeController::class, 'logs']);
        Route::post('/edge-servers/{edgeServer}/restart', [EdgeController::class, 'restart']);
        Route::post('/edge-servers/{edgeServer}/sync-config', [EdgeController::class, 'syncConfig']);
        Route::get('/edge-servers/{edgeServer}/config', [EdgeController::class, 'config']);

        Route::get('/settings/landing', [SettingsController::class, 'getLanding']);
        Route::put('/settings/landing', [SettingsController::class, 'updateLanding']);
        Route::get('/settings/system', [SettingsController::class, 'getSystem']);
        Route::put('/settings/system', [SettingsController::class, 'updateSystem']);
        Route::get('/settings/sms', [SettingsController::class, 'getSms']);
        Route::put('/settings/sms', [SettingsController::class, 'updateSms']);
        Route::post('/settings/sms/test', [SettingsController::class, 'testSms']);
        Route::get('/settings/plans', [SettingsController::class, 'getPlans']);
        Route::put('/settings/plans/{plan}', [SettingsController::class, 'updatePlan']);
        Route::get('/settings/resellers', [SettingsController::class, 'resellers']);
        Route::post('/settings/resellers', [SettingsController::class, 'storeReseller']);
        Route::put('/settings/resellers/{reseller}', [SettingsController::class, 'updateReseller']);
        Route::delete('/settings/resellers/{reseller}', [SettingsController::class, 'deleteReseller']);
        Route::post('/settings/upload-logo', [SettingsController::class, 'uploadLogo']);

        Route::get('/super-admin/settings', [SystemSettingsController::class, 'show']);
        Route::put('/super-admin/settings', [SystemSettingsController::class, 'update']);
        Route::post('/super-admin/test-email', [SystemSettingsController::class, 'testEmail']);
        Route::post('/super-admin/test-sms', [SystemSettingsController::class, 'testSms']);
        Route::post('/super-admin/test-fcm', [SystemSettingsController::class, 'testFcm']);
        Route::get('/super-admin/check', [SystemSettingsController::class, 'check']);

        Route::get('/super-admin/branding', [BrandingController::class, 'showGlobal']);
        Route::put('/super-admin/branding', [BrandingController::class, 'updateGlobal']);
        Route::get('/super-admin/branding/{organization}', [BrandingController::class, 'showForOrganization']);
        Route::put('/super-admin/branding/{organization}', [BrandingController::class, 'updateForOrganization']);

        Route::get('/content', [PlatformContentController::class, 'index']);
        Route::get('/content/{section}', [PlatformContentController::class, 'section']);
        Route::put('/content', [PlatformContentController::class, 'update']);

        Route::get('/notification-priorities', [NotificationPriorityController::class, 'index']);
        Route::post('/notification-priorities', [NotificationPriorityController::class, 'store']);
        Route::put('/notification-priorities/{notificationPriority}', [NotificationPriorityController::class, 'update']);
        Route::delete('/notification-priorities/{notificationPriority}', [NotificationPriorityController::class, 'destroy']);

        Route::get('/organizations/{organization}/sms-quota', [SmsQuotaController::class, 'show']);
        Route::put('/organizations/{organization}/sms-quota', [SmsQuotaController::class, 'update']);

        Route::get('/backups', [SystemBackupController::class, 'index']);
        Route::post('/backups', [SystemBackupController::class, 'store']);
        Route::post('/backups/{backup}/restore', [SystemBackupController::class, 'restore']);
        Route::get('/backups/{backup}/download', [SystemBackupController::class, 'download']);

        Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);
        Route::get('/analytics/time-series', [AnalyticsController::class, 'timeSeries']);
        Route::get('/analytics/by-location', [AnalyticsController::class, 'byLocation']);
        Route::get('/analytics/by-module', [AnalyticsController::class, 'byModule']);
        Route::get('/analytics/response-times', [AnalyticsController::class, 'responseTimes']);
        Route::get('/analytics/compare', [AnalyticsController::class, 'compare']);
        Route::get('/analytics/reports', [AnalyticsController::class, 'reports']);
        Route::post('/analytics/reports', [AnalyticsController::class, 'storeReport']);
        Route::get('/analytics/reports/{report}', [AnalyticsController::class, 'showReport']);
        Route::put('/analytics/reports/{report}', [AnalyticsController::class, 'updateReport']);
        Route::delete('/analytics/reports/{report}', [AnalyticsController::class, 'deleteReport']);
        Route::post('/analytics/reports/{report}/generate', [AnalyticsController::class, 'generateReport']);
        Route::get('/analytics/reports/{report}/download', [AnalyticsController::class, 'downloadReport']);
        Route::get('/analytics/dashboards', [AnalyticsController::class, 'dashboards']);
        Route::post('/analytics/dashboards', [AnalyticsController::class, 'storeDashboard']);
        Route::get('/analytics/dashboards/{dashboard}', [AnalyticsController::class, 'showDashboard']);
        Route::put('/analytics/dashboards/{dashboard}', [AnalyticsController::class, 'updateDashboard']);
        Route::delete('/analytics/dashboards/{dashboard}', [AnalyticsController::class, 'deleteDashboard']);
        Route::post('/analytics/dashboards/{dashboard}/widgets', [AnalyticsController::class, 'createWidget']);
        Route::put('/analytics/dashboards/{dashboard}/widgets/{widget}', [AnalyticsController::class, 'updateWidget']);
        Route::delete('/analytics/dashboards/{dashboard}/widgets/{widget}', [AnalyticsController::class, 'deleteWidget']);
        Route::get('/analytics/export', [AnalyticsController::class, 'export']);

        Route::get('/ai-policies', [AiPolicyController::class, 'index']);
        Route::post('/ai-policies', [AiPolicyController::class, 'store']);
        Route::get('/ai-policies/{aiPolicy}', [AiPolicyController::class, 'show']);
        Route::put('/ai-policies/{aiPolicy}', [AiPolicyController::class, 'update']);
        Route::delete('/ai-policies/{aiPolicy}', [AiPolicyController::class, 'destroy']);
        Route::post('/ai-policies/{aiPolicy}/events', [AiPolicyController::class, 'addEvent']);
        Route::get('/ai-policies/effective', [AiPolicyController::class, 'effective']);

        Route::get('/updates', [UpdateAnnouncementController::class, 'index']);
        Route::post('/updates', [UpdateAnnouncementController::class, 'store']);
        Route::put('/updates/{update}', [UpdateAnnouncementController::class, 'update']);
        Route::delete('/updates/{update}', [UpdateAnnouncementController::class, 'destroy']);
        Route::post('/updates/{update}/toggle', [UpdateAnnouncementController::class, 'togglePublish']);

        Route::get('/ai-commands', [AiCommandController::class, 'index']);
        Route::post('/ai-commands', [AiCommandController::class, 'store']);
        Route::post('/ai-commands/{aiCommand}/ack', [AiCommandController::class, 'ack']);
        Route::post('/ai-commands/{aiCommand}/retry', [AiCommandController::class, 'retry']);
        Route::get('/ai-commands/{aiCommand}/logs', [AiCommandController::class, 'logs']);
    });
});
