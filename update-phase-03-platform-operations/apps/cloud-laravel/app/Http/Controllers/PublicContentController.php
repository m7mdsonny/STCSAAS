<?php

namespace App\Http\Controllers;

use App\Models\PlatformContent;
use Illuminate\Http\JsonResponse;

class PublicContentController extends Controller
{
    public function landing(): JsonResponse
    {
        $content = PlatformContent::where('key', 'landing_settings')->where('published', true)->first();
        return response()->json([
            'content' => $content ? json_decode($content->value ?? '[]', true) : [],
            'published' => (bool) ($content->published ?? false),
        ]);
    }
}
