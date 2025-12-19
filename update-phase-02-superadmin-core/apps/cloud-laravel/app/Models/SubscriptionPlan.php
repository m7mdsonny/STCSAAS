<?php

namespace App\Models;

class SubscriptionPlan extends BaseModel
{
    protected $casts = [
        'available_modules' => 'array',
        'notification_channels' => 'array',
        'is_active' => 'boolean',
        'sms_quota' => 'integer',
    ];

    public function limits()
    {
        return $this->hasMany(SubscriptionPlanLimit::class);
    }
}
