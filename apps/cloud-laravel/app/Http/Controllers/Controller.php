<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    protected function ensureSuperAdmin(Request $request): void
    {
        $user = $request->user();
        if (!$user || ($user->role !== 'super_admin' && !$user->is_super_admin)) {
            abort(403, 'Super admin access required');
        }
    }
}
