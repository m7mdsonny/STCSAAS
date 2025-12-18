<?php

namespace App\Http\Controllers;

use App\Models\BrandingSetting;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandingController extends Controller
{
    public function showGlobal(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $branding = BrandingSetting::whereNull('organization_id')->first();
        if (!$branding) {
            $branding = BrandingSetting::create();
        }

        return response()->json($branding);
    }

    public function updateGlobal(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $branding = BrandingSetting::whereNull('organization_id')->first() ?? new BrandingSetting();

        $branding->fill($this->validateData($request));
        $branding->organization_id = null;
        $branding->save();

        return response()->json($branding);
    }

    public function showForOrganization(Request $request, Organization $organization): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $branding = BrandingSetting::firstOrCreate(['organization_id' => $organization->id]);
        return response()->json($branding);
    }

    public function updateForOrganization(Request $request, Organization $organization): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $branding = BrandingSetting::firstOrCreate(['organization_id' => $organization->id]);
        $branding->update($this->validateData($request));

        return response()->json($branding);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'logo_url' => 'nullable|string|max:500',
            'logo_dark_url' => 'nullable|string|max:500',
            'favicon_url' => 'nullable|string|max:500',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'accent_color' => 'nullable|string|max:20',
            'danger_color' => 'nullable|string|max:20',
            'warning_color' => 'nullable|string|max:20',
            'success_color' => 'nullable|string|max:20',
            'font_family' => 'nullable|string|max:100',
            'heading_font' => 'nullable|string|max:100',
            'border_radius' => 'nullable|string|max:20',
            'custom_css' => 'nullable|string',
        ]);
    }
}
