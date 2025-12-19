<?php

namespace App\Http\Controllers;

use App\Models\PlatformContent;
use App\Models\Reseller;
use App\Models\SubscriptionPlan;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function getLanding(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $content = PlatformContent::firstOrCreate(['key' => 'landing_settings'], [
            'value' => json_encode([]),
            'section' => 'landing',
            'published' => false,
        ]);

        return response()->json([
            'content' => json_decode($content->value ?? '[]', true),
            'published' => (bool) $content->published,
        ]);
    }

    public function updateLanding(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $content = PlatformContent::firstOrCreate(['key' => 'landing_settings']);
        $content->update([
            'value' => json_encode($request->get('content', $request->all())),
            'published' => (bool) $request->get('published', $content->published),
            'section' => 'landing',
        ]);

        return response()->json([
            'content' => json_decode($content->value ?? '[]', true),
            'published' => (bool) $content->published,
        ]);
    }

    public function getSystem(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $settings = SystemSetting::first() ?? SystemSetting::create();
        return response()->json($settings);
    }

    public function updateSystem(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $settings = SystemSetting::first() ?? new SystemSetting();
        $data = $request->only([
            'platform_name',
            'platform_tagline',
            'support_email',
            'support_phone',
            'default_timezone',
            'default_language',
            'maintenance_mode',
            'allow_registration',
            'require_email_verification',
            'session_timeout_minutes',
            'max_login_attempts',
        ]);
        $settings->fill($data);
        $settings->save();

        return response()->json($settings);
    }

    public function getSms(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $settings = SystemSetting::first();
        return response()->json($settings?->sms_settings ?? []);
    }

    public function updateSms(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $settings = SystemSetting::first() ?? new SystemSetting();
        $settings->sms_settings = $request->all();
        $settings->save();

        return response()->json($settings->sms_settings);
    }

    public function testSms(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $settings = SystemSetting::first();
        if (!$settings || empty($settings->sms_settings)) {
            return response()->json(['success' => false, 'message' => 'SMS settings not configured'], 422);
        }

        return response()->json(['success' => true, 'message' => 'SMS configuration saved']);
    }

    public function getPlans(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        return response()->json(SubscriptionPlan::orderBy('price_monthly')->get());
    }

    public function updatePlan(Request $request, SubscriptionPlan $plan): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $plan->update($request->only([
            'name', 'name_ar', 'max_cameras', 'max_edge_servers', 'available_modules', 'notification_channels', 'price_monthly', 'price_yearly', 'is_active'
        ]));

        return response()->json($plan);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $request->validate(['logo' => 'required|file|mimes:png,jpg,jpeg,svg']);
        $path = $request->file('logo')->store('public/logos');

        return response()->json(['url' => Storage::url($path)]);
    }

    public function resellers(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        return response()->json(Reseller::orderBy('name')->get());
    }

    public function storeReseller(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $reseller = Reseller::create($request->all());
        return response()->json($reseller, 201);
    }

    public function updateReseller(Request $request, Reseller $reseller): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $reseller->update($request->all());
        return response()->json($reseller);
    }

    public function deleteReseller(Reseller $reseller): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $reseller->delete();
        return response()->json(['message' => 'Reseller deleted']);
    }
}
