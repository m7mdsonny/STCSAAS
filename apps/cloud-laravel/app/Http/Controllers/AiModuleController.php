<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AiModuleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $modules = DB::table('ai_modules')
            ->orderBy('display_order')
            ->get();

        return response()->json($modules);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $module = DB::table('ai_modules')->where('id', $id)->first();

        if (!$module) {
            return response()->json(['message' => 'AI Module not found'], 404);
        }

        return response()->json($module);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $module = DB::table('ai_modules')->where('id', $id)->first();

        if (!$module) {
            return response()->json(['message' => 'AI Module not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'display_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'category' => 'sometimes|string',
            'is_active' => 'nullable|boolean',
            'default_config' => 'nullable|array',
        ]);

        DB::table('ai_modules')
            ->where('id', $id)
            ->update(array_merge($data, ['updated_at' => now()]));

        $updated = DB::table('ai_modules')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function getOrganizationConfigs(Request $request): JsonResponse
    {
        $configs = DB::table('organization_ai_modules')
            ->where('organization_id', $request->user()->organization_id)
            ->join('ai_modules', 'organization_ai_modules.ai_module_id', '=', 'ai_modules.id')
            ->select(
                'organization_ai_modules.*',
                'ai_modules.name as module_name',
                'ai_modules.module_key',
                'ai_modules.description',
                'ai_modules.category'
            )
            ->get();

        return response()->json($configs);
    }

    public function getOrganizationConfig(Request $request, string $moduleId): JsonResponse
    {
        $config = DB::table('organization_ai_modules')
            ->where('organization_id', $request->user()->organization_id)
            ->where('ai_module_id', $moduleId)
            ->first();

        if (!$config) {
            return response()->json(['message' => 'Module config not found'], 404);
        }

        return response()->json($config);
    }

    public function updateOrganizationConfig(Request $request, string $moduleId): JsonResponse
    {
        $data = $request->validate([
            'is_enabled' => 'nullable|boolean',
            'config' => 'nullable|array',
        ]);

        $config = DB::table('organization_ai_modules')
            ->where('organization_id', $request->user()->organization_id)
            ->where('ai_module_id', $moduleId)
            ->first();

        if (!$config) {
            // Create new config
            $configId = DB::table('organization_ai_modules')->insertGetId([
                'organization_id' => $request->user()->organization_id,
                'ai_module_id' => $moduleId,
                'is_enabled' => $data['is_enabled'] ?? true,
                'config' => json_encode($data['config'] ?? []),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $config = DB::table('organization_ai_modules')->where('id', $configId)->first();
        } else {
            DB::table('organization_ai_modules')
                ->where('id', $config->id)
                ->update([
                    'is_enabled' => $data['is_enabled'] ?? $config->is_enabled,
                    'config' => json_encode($data['config'] ?? json_decode($config->config ?? '{}', true)),
                    'updated_at' => now(),
                ]);
            $config = DB::table('organization_ai_modules')->where('id', $config->id)->first();
        }

        return response()->json($config);
    }

    public function enableModule(Request $request, string $moduleId): JsonResponse
    {
        $config = DB::table('organization_ai_modules')
            ->where('organization_id', $request->user()->organization_id)
            ->where('ai_module_id', $moduleId)
            ->first();

        if (!$config) {
            $configId = DB::table('organization_ai_modules')->insertGetId([
                'organization_id' => $request->user()->organization_id,
                'ai_module_id' => $moduleId,
                'is_enabled' => true,
                'config' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $config = DB::table('organization_ai_modules')->where('id', $configId)->first();
        } else {
            DB::table('organization_ai_modules')
                ->where('id', $config->id)
                ->update(['is_enabled' => true, 'updated_at' => now()]);
            $config = DB::table('organization_ai_modules')->where('id', $config->id)->first();
        }

        return response()->json($config);
    }

    public function disableModule(Request $request, string $moduleId): JsonResponse
    {
        $config = DB::table('organization_ai_modules')
            ->where('organization_id', $request->user()->organization_id)
            ->where('ai_module_id', $moduleId)
            ->first();

        if (!$config) {
            return response()->json(['message' => 'Module config not found'], 404);
        }

        DB::table('organization_ai_modules')
            ->where('id', $config->id)
            ->update(['is_enabled' => false, 'updated_at' => now()]);

        $updated = DB::table('organization_ai_modules')->where('id', $config->id)->first();
        return response()->json($updated);
    }
}

