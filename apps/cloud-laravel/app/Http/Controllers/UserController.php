<?php

namespace App\Http\Controllers;

use App\Helpers\RoleHelper;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = User::query();

        // Super admin can see all users
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            // Organization users can only see users in their organization
            if ($user->organization_id) {
                $query->where('organization_id', $user->organization_id);
            } else {
                // User without organization can't see any users
                return response()->json(['data' => [], 'total' => 0]);
            }
        }

        // Super admin can filter by organization
        if ($request->filled('organization_id') && RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $query->where('organization_id', $request->get('organization_id'));
        }

        if ($request->filled('role')) {
            $normalizedRole = RoleHelper::normalize($request->get('role'));
            $query->where('role', $normalizedRole);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->get('per_page', 15);
        $users = $query->orderByDesc('created_at')->paginate($perPage);

        // Normalize roles in response
        $users->getCollection()->transform(function ($u) {
            $u->role = RoleHelper::normalize($u->role);
            return $u;
        });

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        $currentUser = request()->user();
        
        // Check access
        if (!RoleHelper::isSuperAdmin($currentUser->role, $currentUser->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess(request(), $user->organization_id);
        }

        $user->role = RoleHelper::normalize($user->role);
        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        
        // Only super admin or organization managers can create users
        if (!RoleHelper::isSuperAdmin($currentUser->role, $currentUser->is_super_admin ?? false)) {
            $this->ensureCanManage($request);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:50',
            'role' => 'required|string|in:' . implode(',', RoleHelper::VALID_ROLES),
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        // Normalize role
        $data['role'] = RoleHelper::normalize($data['role']);

        // Non-super-admin users can only create users for their organization
        if (!RoleHelper::isSuperAdmin($currentUser->role, $currentUser->is_super_admin ?? false)) {
            // Use provided organization_id if valid, otherwise use current user's organization
            if (empty($data['organization_id']) || $data['organization_id'] != $currentUser->organization_id) {
                $data['organization_id'] = $currentUser->organization_id;
            }
            
            // Non-super-admin cannot create super_admin users
            if ($data['role'] === RoleHelper::SUPER_ADMIN) {
                return response()->json(['message' => 'Cannot create super admin users'], 403);
            }
        } else {
            // Super admin: if role is super_admin, remove organization_id
            if ($data['role'] === RoleHelper::SUPER_ADMIN) {
                $data['organization_id'] = null;
            }
        }
        
        // Ensure organization_id is set for non-super-admin roles
        if ($data['role'] !== RoleHelper::SUPER_ADMIN && empty($data['organization_id'])) {
            return response()->json(['message' => 'Organization is required for this role'], 422);
        }

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        $user->role = RoleHelper::normalize($user->role);
        return response()->json($user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        
        // Check access
        if (!RoleHelper::isSuperAdmin($currentUser->role, $currentUser->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess($request, $user->organization_id);
            $this->ensureCanManage($request);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
            'role' => 'sometimes|string|in:' . implode(',', RoleHelper::VALID_ROLES),
            'is_active' => 'nullable|boolean',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        // Normalize role if provided
        if (isset($data['role'])) {
            $data['role'] = RoleHelper::normalize($data['role']);
            
            // Non-super-admin cannot assign super_admin role
            if ($data['role'] === RoleHelper::SUPER_ADMIN && 
                !RoleHelper::isSuperAdmin($currentUser->role, $currentUser->is_super_admin ?? false)) {
                return response()->json(['message' => 'Cannot assign super admin role'], 403);
            }
            
            // Super admin users should not have organization_id
            if ($data['role'] === RoleHelper::SUPER_ADMIN) {
                $data['organization_id'] = null;
            }
        }

        // Only super admin can change organization_id
        if (isset($data['organization_id']) && 
            !RoleHelper::isSuperAdmin($currentUser->role, $currentUser->is_super_admin ?? false)) {
            unset($data['organization_id']);
        }

        $user->update($data);
        $user->role = RoleHelper::normalize($user->role);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        $currentUser = request()->user();
        
        // Check access
        if (!RoleHelper::isSuperAdmin($currentUser->role, $currentUser->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess(request(), $user->organization_id);
            $this->ensureCanManage(request());
        }

        // Prevent self-deletion
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json($user);
    }

    public function resetPassword(User $user): JsonResponse
    {
        $newPassword = str()->random(12);
        $user->update(['password' => Hash::make($newPassword)]);

        return response()->json(['message' => 'Password reset', 'new_password' => $newPassword]);
    }
}
