<?php

namespace App\Http\Controllers;

use App\Models\EdgeServer;
use App\Models\License;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Organization::query();

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('subscription_plan')) {
            $query->where('subscription_plan', $request->get('subscription_plan'));
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $organizations = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($organizations);
    }

    public function show(Organization $organization): JsonResponse
    {
        return response()->json($organization);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:255',
            'subscription_plan' => 'required|string',
            'max_cameras' => 'nullable|integer|min:1',
            'max_edge_servers' => 'nullable|integer|min:1',
            'reseller_id' => 'nullable|exists:resellers,id',
            'distributor_id' => 'nullable|exists:distributors,id',
        ]);

        $plan = SubscriptionPlan::where('name', $data['subscription_plan'])->first();
        if (!$plan) {
            $plan = SubscriptionPlan::first();
        }

        if ($plan) {
            $data['max_cameras'] = $data['max_cameras'] ?? $plan->max_cameras;
            $data['max_edge_servers'] = $data['max_edge_servers'] ?? $plan->max_edge_servers;
        }

        $organization = Organization::create($data);
        if ($plan && property_exists($plan, 'sms_quota')) {
            $organization->smsQuota()->create([
                'monthly_limit' => $plan->sms_quota ?? 0,
                'used_this_month' => 0,
            ]);
        }

        return response()->json($organization, 201);
    }

    public function update(Request $request, Organization $organization): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:255',
            'subscription_plan' => 'sometimes|string',
            'max_cameras' => 'nullable|integer|min:1',
            'max_edge_servers' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
            'reseller_id' => 'nullable|exists:resellers,id',
            'distributor_id' => 'nullable|exists:distributors,id',
            'logo_url' => 'nullable|string|max:500',
        ]);

        $organization->update($data);

        return response()->json($organization);
    }

    public function destroy(Organization $organization): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $organization->delete();
        return response()->json(['message' => 'Organization deleted']);
    }

    public function toggleActive(Organization $organization): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $organization->is_active = !$organization->is_active;
        $organization->save();

        return response()->json($organization);
    }

    public function updatePlan(Request $request, Organization $organization): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'subscription_plan' => 'required|string',
            'max_cameras' => 'nullable|integer|min:1',
            'max_edge_servers' => 'nullable|integer|min:1',
        ]);

        $organization->update($data);

        $plan = SubscriptionPlan::where('name', $data['subscription_plan'])->first();
        if ($plan && property_exists($plan, 'sms_quota')) {
            $organization->smsQuota()->updateOrCreate(
                ['organization_id' => $organization->id],
                ['monthly_limit' => $plan->sms_quota ?? 0]
            );
        }

        return response()->json($organization);
    }

    public function stats(Organization $organization): JsonResponse
    {
        return response()->json([
            'users_count' => User::where('organization_id', $organization->id)->count(),
            'edge_servers_count' => EdgeServer::where('organization_id', $organization->id)->count(),
            'cameras_count' => 0,
            'alerts_today' => License::where('organization_id', $organization->id)->count(),
            'storage_used_gb' => 0,
        ]);
    }

    public function uploadLogo(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();
        
        // Check if user can manage this organization
        if (!$user->is_super_admin && $user->organization_id !== $organization->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'logo' => 'required|file|mimes:png,jpg,jpeg,svg|max:5120', // 5MB max
        ]);

        $file = $request->file('logo');
        $path = $file->store('public/organizations/logos');
        $url = Storage::url($path);

        $organization->update(['logo_url' => $url]);

        return response()->json([
            'url' => $url,
            'logo_url' => $url,
            'organization' => $organization->fresh(),
        ]);
    }
}
