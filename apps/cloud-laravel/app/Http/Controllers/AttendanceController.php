<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('attendance_records')
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('person_id')) {
            $query->where('person_id', $request->get('person_id'));
        }

        if ($request->filled('camera_id')) {
            $query->where('camera_id', $request->get('camera_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('check_in_time', $request->get('date'));
        }

        if ($request->filled('from')) {
            $query->where('check_in_time', '>=', $request->get('from'));
        }

        if ($request->filled('to')) {
            $query->where('check_in_time', '<=', $request->get('to'));
        }

        $perPage = (int) $request->get('per_page', 15);
        $records = $query->orderByDesc('check_in_time')->paginate($perPage);

        return response()->json($records);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $record = DB::table('attendance_records')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }

        return response()->json($record);
    }

    public function getSummary(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date',
            'department' => 'nullable|string',
        ]);

        $query = DB::table('attendance_records')
            ->join('registered_faces', 'attendance_records.person_id', '=', 'registered_faces.id')
            ->where('attendance_records.organization_id', $request->user()->organization_id)
            ->whereBetween('attendance_records.check_in_time', [$request->get('from'), $request->get('to')]);

        if ($request->filled('department')) {
            $query->where('registered_faces.department', $request->get('department'));
        }

        $summary = $query->select(
            'registered_faces.id as person_id',
            'registered_faces.person_name',
            'registered_faces.employee_id',
            'registered_faces.department',
            DB::raw('COUNT(DISTINCT DATE(attendance_records.check_in_time)) as total_days'),
            DB::raw('COUNT(*) as present_days'),
            DB::raw('SUM(CASE WHEN attendance_records.is_late = true THEN 1 ELSE 0 END) as late_days'),
            DB::raw('SUM(CASE WHEN attendance_records.is_early_departure = true THEN 1 ELSE 0 END) as early_departure_days')
        )
        ->groupBy('registered_faces.id', 'registered_faces.person_name', 'registered_faces.employee_id', 'registered_faces.department')
        ->get();

        return response()->json($summary);
    }

    public function getDailyReport(Request $request, string $date): JsonResponse
    {
        $records = DB::table('attendance_records')
            ->where('organization_id', $request->user()->organization_id)
            ->whereDate('check_in_time', $date)
            ->get();

        $totalEmployees = DB::table('registered_faces')
            ->where('organization_id', $request->user()->organization_id)
            ->where('category', 'employee')
            ->where('is_active', true)
            ->count();

        $present = $records->count();
        $absent = $totalEmployees - $present;
        $late = $records->where('is_late', true)->count();
        $earlyDeparture = $records->where('is_early_departure', true)->count();

        return response()->json([
            'date' => $date,
            'total_employees' => $totalEmployees,
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'early_departure' => $earlyDeparture,
            'records' => $records,
        ]);
    }

    public function getPersonHistory(Request $request, string $personId): JsonResponse
    {
        $query = DB::table('attendance_records')
            ->where('person_id', $personId)
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('from')) {
            $query->where('check_in_time', '>=', $request->get('from'));
        }

        if ($request->filled('to')) {
            $query->where('check_in_time', '<=', $request->get('to'));
        }

        $perPage = (int) $request->get('per_page', 15);
        $records = $query->orderByDesc('check_in_time')->paginate($perPage);

        return response()->json($records);
    }

    public function manualCheckIn(Request $request): JsonResponse
    {
        $data = $request->validate([
            'person_id' => 'required|string|exists:registered_faces,id',
            'camera_id' => 'required|string|exists:cameras,id',
        ]);

        $recordId = DB::table('attendance_records')->insertGetId([
            'organization_id' => $request->user()->organization_id,
            'person_id' => $data['person_id'],
            'camera_id' => $data['camera_id'],
            'check_in_time' => now(),
            'is_manual' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $record = DB::table('attendance_records')->where('id', $recordId)->first();
        return response()->json($record, 201);
    }

    public function manualCheckOut(Request $request, string $id): JsonResponse
    {
        $record = DB::table('attendance_records')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }

        DB::table('attendance_records')
            ->where('id', $id)
            ->update([
                'check_out_time' => now(),
                'updated_at' => now(),
            ]);

        $updated = DB::table('attendance_records')->where('id', $id)->first();
        return response()->json($updated);
    }
}

