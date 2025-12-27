<?php

namespace App\Http\Controllers;

use App\Models\PlatformContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class PublicContentController extends Controller
{
    public function landing(): JsonResponse
    {
        try {
            // Try to get published content first
            $content = PlatformContent::where('key', 'landing_settings')
                ->when(
                    Schema::hasColumn('platform_contents', 'published'),
                    fn($query) => $query->where('published', true),
                    fn($query) => $query
                )
                ->first();
            
            // If no published content, try to get any content
            if (!$content) {
                $content = PlatformContent::where('key', 'landing_settings')->first();
            }
            
            $data = $content && $content->value 
                ? json_decode($content->value, true) 
                : [];
            
            // Ensure data is an array
            if (!is_array($data)) {
                $data = [];
            }
            
            $published = false;
            if ($content) {
                // Check if published column exists and get its value
                if (Schema::hasColumn('platform_contents', 'published')) {
                    $published = (bool) ($content->published ?? false);
                } else {
                    // If published column doesn't exist, consider it published if content exists
                    $published = true;
                }
            }
            
            return response()->json([
                'content' => array_merge($this->landingDefaults(), $data),
                'published' => $published,
            ]);
        } catch (\Exception $e) {
            // If database query fails, return defaults
            \Log::error('PublicContentController::landing error: ' . $e->getMessage());
            
            return response()->json([
                'content' => $this->landingDefaults(),
                'published' => false,
            ]);
        }
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
