<?php

namespace App\Http\Controllers;

use App\Models\SMSQuota;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SmsQuotaController extends Controller
{
    public function show(int $organizationId): JsonResponse
    {
        $quota = SMSQuota::firstOrCreate(
            ['organization_id' => $organizationId],
            ['monthly_limit' => 0, 'used_this_month' => 0]
        );

        return response()->json($quota);
    }

    public function update(Request $request, int $organizationId): JsonResponse
    {
        $data = $request->validate([
            'monthly_limit' => 'required|integer|min:0',
            'used_this_month' => 'nullable|integer|min:0',
            'resets_at' => 'nullable|date',
        ]);

        $quota = SMSQuota::firstOrCreate(
            ['organization_id' => $organizationId],
            ['monthly_limit' => 0, 'used_this_month' => 0]
        );

        $quota->update($data);

        return response()->json($quota);
    }
}
