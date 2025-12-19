<?php

namespace App\Models;

class AICommandTarget extends BaseModel
{
    protected $table = 'ai_command_targets';

    protected $casts = [
        'sent_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];
}
