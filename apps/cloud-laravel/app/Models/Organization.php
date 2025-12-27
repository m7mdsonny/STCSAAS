<?php

namespace App\Models;

class Organization extends BaseModel
{
    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function reseller()
    {
        return $this->belongsTo(Reseller::class);
    }

    public function distributor()
    {
        return $this->belongsTo(Distributor::class);
    }

    public function subscriptionPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan', 'name');
    }

    public function branding()
    {
        return $this->hasOne(BrandingSetting::class);
    }

    public function smsQuota()
    {
        return $this->hasOne(SMSQuota::class);
    }

    public function registeredFaces()
    {
        return $this->hasMany(RegisteredFace::class);
    }

    public function registeredVehicles()
    {
        return $this->hasMany(RegisteredVehicle::class);
    }

    public function vehicleAccessLogs()
    {
        return $this->hasMany(VehicleAccessLog::class);
    }
}
