<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->get('organization_id'));
        }

        if ($request->filled('role')) {
            $query->where('role', $request->get('role'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->get('per_page', 15);
        $users = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:50',
            'role' => 'required|string',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
            'role' => 'sometimes|string',
            'is_active' => 'nullable|boolean',
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
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

    public function getSuperAdmins(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $superAdmins = User::where(function ($query) {
            $query->where('role', 'super_admin')
                ->orWhere('is_super_admin', true);
        })->get();

        // Format response to match frontend expectations
        $formatted = $superAdmins->map(function ($user) {
            return [
                'id' => (string) $user->id,
                'user_id' => $user->id,
                'permissions' => [],
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ];
        });

        return response()->json($formatted);
    }

    public function addSuperAdmin(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $user = User::findOrFail($data['user_id']);
        $user->update([
            'role' => 'super_admin',
            'is_super_admin' => true,
        ]);

        return response()->json([
            'id' => (string) $user->id,
            'user_id' => $user->id,
            'permissions' => [],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    public function removeSuperAdmin(Request $request, User $user): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        // Prevent removing yourself
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot remove your own super admin privileges'], 403);
        }

        $user->update([
            'role' => 'user',
            'is_super_admin' => false,
        ]);

        return response()->json(['message' => 'Super admin privileges removed']);
    }

    private function ensureSuperAdmin(Request $request): void
    {
        if (!$request->user() || !$request->user()->is_super_admin) {
            abort(403, 'Unauthorized: Super admin access required');
        }
    }
}
