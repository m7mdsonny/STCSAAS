<?php

namespace App\Http\Controllers;

use App\Models\PlatformContent;
use Illuminate\Http\JsonResponse;

class PublicContentController extends Controller
{
    public function landing(): JsonResponse
    {
        $content = PlatformContent::where('key', 'landing_settings')->where('published', true)->first();
        $data = $content ? json_decode($content->value ?? '[]', true) : [];

        return response()->json([
            'content' => array_merge($this->landingDefaults(), $data ?? []),
            'published' => (bool) ($content->published ?? false),
        ]);
    }

    private function landingDefaults(): array
    {
        return [
            'hero_title' => 'منصة تحليل الفيديو بالذكاء الاصطناعي',
            'hero_subtitle' => 'حول كاميرات المراقبة الى عيون ذكية تحمي منشاتك وتحلل بياناتك في الوقت الفعلي',
            'hero_button_text' => 'ابدا تجربتك المجانية - 14 يوم',
            'about_title' => 'عن المنصة',
            'about_description' => 'حل متكامل لادارة المراقبة بالفيديو والذكاء الاصطناعي مع تكاملات جاهزة.',
            'contact_email' => 'info@stc-solutions.com',
            'contact_phone' => '+966 11 000 0000',
            'contact_address' => 'الرياض، المملكة العربية السعودية',
            'whatsapp_number' => '+966500000000',
            'show_whatsapp_button' => true,
            'footer_text' => 'STC Solutions. جميع الحقوق محفوظة',
            'social_twitter' => null,
            'social_linkedin' => null,
            'social_instagram' => null,
            'features' => [],
            'stats' => [],
        ];
    }
}
