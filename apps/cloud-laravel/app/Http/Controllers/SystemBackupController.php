<?php

namespace App\Http\Controllers;

use App\Models\SystemBackup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

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
            'meta' => 'nullable|array',
        ]);

        if (isset($data['backup'])) {
            $path = $data['backup']->store('backups');
            $status = 'uploaded';
        } else {
            $path = $this->createDatabaseDump();
            $status = 'completed';
        }

        $backup = SystemBackup::create([
            'file_path' => $path,
            'status' => $status,
            'meta' => $data['meta'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json($backup, 201);
    }

    public function restore(SystemBackup $backup): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        if (!Storage::exists($backup->file_path)) {
            return response()->json(['message' => 'Backup file missing'], 404);
        }

        $this->runRestore(Storage::path($backup->file_path));

        $backup->update(['status' => 'restored']);

        return response()->json(['message' => 'Database restored successfully']);
    }

    public function download(SystemBackup $backup)
    {
        $this->ensureSuperAdmin(request());

        if (!Storage::exists($backup->file_path)) {
            return response()->json(['message' => 'Backup file missing'], 404);
        }

        return Storage::download($backup->file_path, basename($backup->file_path));
    }

    protected function createDatabaseDump(): string
    {
        $connection = config('database.default');
        $config = config("database.connections.$connection");
        $timestamp = now()->format('Ymd_His');
        $filename = "backups/{$connection}_{$timestamp}.sql";

        Storage::makeDirectory('backups');

        if ($config['driver'] === 'pgsql') {
            $command = [
                'pg_dump',
                '-h', $config['host'],
                '-p', (string) $config['port'],
                '-U', $config['username'],
                '-d', $config['database'],
                '-f', Storage::path($filename),
            ];

            $process = new Process($command, null, ['PGPASSWORD' => $config['password'] ?? '']);
            $process->mustRun();
        } elseif ($config['driver'] === 'mysql') {
            $command = [
                'mysqldump',
                '-h', $config['host'],
                '-P', (string) $config['port'],
                '-u', $config['username'],
                '-p' . ($config['password'] ?? ''),
                $config['database'],
            ];

            $process = new Process($command);
            $process->run();
            if (!$process->isSuccessful()) {
                throw new \RuntimeException($process->getErrorOutput());
            }

            file_put_contents(Storage::path($filename), $process->getOutput());
        } else {
            throw new \RuntimeException('Unsupported database driver for backup');
        }

        return $filename;
    }

    protected function runRestore(string $path): void
    {
        $connection = config('database.default');
        $config = config("database.connections.$connection");

        if ($config['driver'] === 'pgsql') {
            $command = [
                'psql',
                '-h', $config['host'],
                '-p', (string) $config['port'],
                '-U', $config['username'],
                '-d', $config['database'],
                '-f', $path,
            ];
            $process = new Process($command, null, ['PGPASSWORD' => $config['password'] ?? '']);
            $process->mustRun();
        } elseif ($config['driver'] === 'mysql') {
            $command = [
                'mysql',
                '-h', $config['host'],
                '-P', (string) $config['port'],
                '-u', $config['username'],
                '-p' . ($config['password'] ?? ''),
                $config['database'],
            ];

            $process = new Process($command);
            $process->setInput(file_get_contents($path));
            $process->run();

            if (!$process->isSuccessful()) {
                throw new \RuntimeException($process->getErrorOutput());
            }
        } else {
            throw new \RuntimeException('Unsupported database driver for restore');
        }
    }
}
