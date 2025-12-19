<?php

namespace App\Http\Controllers;

use App\Models\SystemBackup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class SystemBackupController extends Controller
{
    public function index(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        return response()->json(SystemBackup::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'backup' => 'nullable|file',
            'tables' => 'nullable|array',
            'meta' => 'nullable|array',
        ]);

        if (isset($data['backup'])) {
            $path = $data['backup']->store('backups');
        } else {
            $tables = $data['tables'] ?? Schema::getTableListing();
            $export = [];

            foreach ($tables as $table) {
                if (in_array($table, ['migrations'])) {
                    continue;
                }
                $export[$table] = DB::table($table)->get();
            }

            $filename = 'backups/backup-' . now()->format('Ymd_His') . '.json';
            Storage::put($filename, json_encode($export));
            $path = $filename;
        }

        $backup = SystemBackup::create([
            'file_path' => $path,
            'meta' => $data['meta'] ?? null,
            'created_by' => $request->user()?->id,
            'status' => 'completed',
        ]);

        return response()->json($backup, 201);
    }

    public function restore(Request $request, SystemBackup $backup): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $request->validate(['confirm' => 'required|boolean']);

        if (!Storage::exists($backup->file_path)) {
            return response()->json(['message' => 'Backup file missing'], 404);
        }

        $content = Storage::get($backup->file_path);
        $data = json_decode($content, true);

        if (!is_array($data)) {
            return response()->json(['message' => 'Invalid backup format'], 422);
        }

        DB::transaction(function () use ($data) {
            foreach ($data as $table => $rows) {
                if (!Schema::hasTable($table) || !is_array($rows)) {
                    continue;
                }
                DB::table($table)->delete();
                if (!empty($rows)) {
                    DB::table($table)->insert(array_map(fn ($row) => (array) $row, $rows));
                }
            }
        });

        $backup->update(['status' => 'restored', 'meta' => array_merge($backup->meta ?? [], ['restored_at' => now()])]);

        return response()->json(['message' => 'Restore completed', 'backup' => $backup]);
    }

    public function download(SystemBackup $backup)
    {
        $this->ensureSuperAdmin(request());
        if (!Storage::exists($backup->file_path)) {
            return response()->json(['message' => 'Backup not found'], 404);
        }

        return Storage::download($backup->file_path);
    }
}
