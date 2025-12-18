<?php

namespace App\Models;

class License extends BaseModel
{
    protected $table = 'licenses';

    protected $casts = [
        'modules' => 'array',
        'trial_ends_at' => 'datetime',
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}
