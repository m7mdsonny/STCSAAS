<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use App\Models\License;

class LicenseController extends Controller
{
    public function validateKey(Request $request): JsonResponse
    {
        $request->validate([
            'license_key' => 'required|string',
            'edge_id' => 'required|string',
        ]);

        $license = License::where('license_key', $request->license_key)->first();
        if (!$license) {
            return response()->json(['valid' => false, 'reason' => 'not_found'], 404);
        }

        $now = Carbon::now();
        $expires = Carbon::parse($license->expires_at);
        $graceDays = (int) config('app.license_grace', 14);

        if ($expires->lt($now) && $now->diffInDays($expires) > $graceDays) {
            return response()->json(['valid' => false, 'reason' => 'expired'], 403);
        }

        return response()->json([
            'valid' => true,
            'edge_id' => $request->edge_id,
            'organization_id' => $license->organization_id,
            'expires_at' => $license->expires_at,
            'grace_days' => $graceDays,
        ]);
    }
}
