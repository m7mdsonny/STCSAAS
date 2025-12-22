<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        $identifier = strtolower(trim($request->email));

        $user = User::whereRaw('LOWER(email) = ?', [$identifier])
            ->orWhere('phone', $identifier)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials provided.',
                'status' => 401,
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is disabled. Contact an administrator.',
                'status' => 403,
            ], 403);
        }

        $user->forceFill(['last_login' => now()])->save();

        // Ensure role is normalized in response
        $user->role = \App\Helpers\RoleHelper::normalize($user->role);

        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            // Ensure role is normalized in response
            $user->role = \App\Helpers\RoleHelper::normalize($user->role);
        }
        return response()->json($user);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|same:password',
            'phone' => 'nullable|string|max:20'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'user',
            'is_active' => true
        ]);

        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user], 201);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'avatar_url' => 'sometimes|nullable|string|max:500'
        ]);

        $user->update($request->only(['name', 'phone', 'avatar_url']));

        return response()->json($user);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|same:password'
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }
}
