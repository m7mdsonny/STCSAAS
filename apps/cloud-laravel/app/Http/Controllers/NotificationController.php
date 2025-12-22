<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\DeviceToken;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $user = request()->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orWhere('organization_id', $user->organization_id)
            ->latest()
            ->limit(100)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Register FCM device token for push notifications
     */
    public function registerDevice(Request $request): JsonResponse
    {
        $request->validate([
            'device_token' => 'required|string',
            'platform' => 'required|string|in:android,ios',
            'device_id' => 'nullable|string',
            'device_name' => 'nullable|string',
            'app_version' => 'nullable|string',
        ]);

        $user = $request->user();

        try {
            $deviceToken = DeviceToken::updateOrCreate(
                [
                    'token' => $request->device_token,
                    'user_id' => $user->id,
                ],
                [
                    'device_type' => $request->platform,
                    'device_id' => $request->device_id,
                    'device_name' => $request->device_name,
                    'app_version' => $request->app_version,
                    'is_active' => true,
                    'last_used_at' => now(),
                ]
            );

            Log::info('Device token registered', [
                'user_id' => $user->id,
                'device_token' => substr($request->device_token, 0, 20) . '...',
                'platform' => $request->platform,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Device token registered successfully',
                'device' => $deviceToken,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to register device token', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to register device token',
            ], 500);
        }
    }

    /**
     * Unregister FCM device token
     */
    public function unregisterDevice(Request $request): JsonResponse
    {
        $request->validate([
            'device_token' => 'required|string',
        ]);

        $user = $request->user();

        try {
            DeviceToken::where('token', $request->device_token)
                ->where('user_id', $user->id)
                ->update(['is_active' => false]);

            Log::info('Device token unregistered', [
                'user_id' => $user->id,
                'device_token' => substr($request->device_token, 0, 20) . '...',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Device token unregistered successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to unregister device token', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to unregister device token',
            ], 500);
        }
    }

    /**
     * Get user's registered devices
     */
    public function getDevices(): JsonResponse
    {
        $user = request()->user();

        $devices = DeviceToken::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        return response()->json($devices);
    }
}
