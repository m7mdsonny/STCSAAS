<?php

namespace App\Http\Controllers;

use App\Services\UpdateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SystemUpdateController extends Controller
{
    private UpdateService $updateService;

    public function __construct(UpdateService $updateService)
    {
        $this->updateService = $updateService;
    }

    /**
     * Get all available updates
     */
    public function index(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        
        try {
            $updates = $this->updateService->getAvailableUpdates();
            $currentVersion = $this->updateService->getCurrentVersion();
            
            return response()->json([
                'current_version' => $currentVersion,
                'updates' => $updates,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get updates: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload update package
     */
    public function upload(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        
        $request->validate([
            'package' => 'required|file|mimes:zip|max:102400', // 100MB max
        ]);

        try {
            $result = $this->updateService->uploadUpdatePackage($request->file('package'));
            
            return response()->json([
                'success' => true,
                'message' => 'Update package uploaded successfully',
                'data' => $result,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to upload update: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Install an update
     */
    public function install(Request $request, string $updateId): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        
        try {
            $result = $this->updateService->installUpdate($updateId);
            
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['update'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to install update: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Rollback an update
     */
    public function rollback(Request $request, string $backupId): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        
        try {
            $result = $this->updateService->rollback($backupId);
            
            return response()->json([
                'success' => true,
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to rollback update: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get current version
     */
    public function currentVersion(): JsonResponse
    {
        try {
            $version = $this->updateService->getCurrentVersion();
            
            return response()->json([
                'version' => $version,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

