<?php

namespace App\Http\Controllers;

use App\Models\AICommand;
use App\Models\AICommandLog;
use App\Models\AICommandTarget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AICommandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $query = AICommand::with('targets')->orderByDesc('created_at');

        if ($request->filled('organization_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('organization_id', $request->get('organization_id'))
                    ->orWhereHas('targets', function ($t) use ($request) {
                        $t->where('organization_id', $request->get('organization_id'));
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->boolean('templates_only')) {
            $query->where('is_template', true);
        }

        return response()->json($query->paginate((int) $request->get('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'command_type' => 'required|string|max:255',
            'payload' => 'nullable|array',
            'is_template' => 'nullable|boolean',
            'organization_id' => 'nullable|integer',
            'targets' => 'nullable|array',
            'targets.*.organization_id' => 'nullable|integer',
            'targets.*.edge_server_id' => 'nullable|integer',
            'targets.*.camera_group' => 'nullable|string|max:255',
        ]);

        $command = null;
        DB::transaction(function () use ($data, $request, &$command) {
            $command = AICommand::create([
                'title' => $data['title'],
                'command_type' => $data['command_type'],
                'payload' => $data['payload'] ?? [],
                'is_template' => $data['is_template'] ?? false,
                'target_all' => empty($data['targets']) && empty($data['organization_id']),
                'organization_id' => $data['organization_id'] ?? null,
                'created_by' => $request->user()?->id,
                'status' => $data['is_template'] ?? false ? 'template' : 'pending',
            ]);

            if (!empty($data['targets'])) {
                foreach ($data['targets'] as $target) {
                    AICommandTarget::create([
                        'ai_command_id' => $command->id,
                        'organization_id' => $target['organization_id'] ?? null,
                        'edge_server_id' => $target['edge_server_id'] ?? null,
                        'camera_group' => $target['camera_group'] ?? null,
                        'status' => 'pending',
                    ]);
                }
            } else {
                AICommandTarget::create([
                    'ai_command_id' => $command->id,
                    'organization_id' => $data['organization_id'] ?? null,
                    'status' => 'pending',
                ]);
            }

            AICommandLog::create([
                'ai_command_id' => $command->id,
                'status' => 'created',
                'message' => 'Command created',
            ]);
        });

        return response()->json($command->load('targets'), 201);
    }

    public function updateStatus(Request $request, AICommand $aiCommand): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'status' => 'required|string',
            'message' => 'nullable|string',
        ]);

        $aiCommand->update([
            'status' => $data['status'],
            'last_attempt_at' => now(),
            'acknowledged_at' => $data['status'] === 'acknowledged' ? now() : $aiCommand->acknowledged_at,
        ]);

        AICommandLog::create([
            'ai_command_id' => $aiCommand->id,
            'status' => $data['status'],
            'message' => $data['message'] ?? null,
        ]);

        return response()->json($aiCommand->load('targets'));
    }

    public function ack(Request $request, AICommand $aiCommand): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'target_id' => 'nullable|integer',
            'response' => 'nullable|array',
            'message' => 'nullable|string',
        ]);

        $target = null;
        if ($data['target_id'] ?? null) {
            $target = AICommandTarget::where('id', $data['target_id'])->where('ai_command_id', $aiCommand->id)->first();
            if ($target) {
                $target->update([
                    'status' => 'acknowledged',
                    'acknowledged_at' => now(),
                ]);
            }
        }

        $aiCommand->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
        ]);

        AICommandLog::create([
            'ai_command_id' => $aiCommand->id,
            'status' => 'acknowledged',
            'message' => $data['message'] ?? 'Edge acknowledged',
            'response' => $data['response'] ?? null,
        ]);

        return response()->json($aiCommand->load('targets'));
    }
}
