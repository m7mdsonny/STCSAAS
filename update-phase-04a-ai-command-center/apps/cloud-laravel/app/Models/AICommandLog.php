<?php

namespace App\Models;

class AICommandLog extends BaseModel
{
    protected $table = 'ai_command_logs';

    protected $casts = [
        'response' => 'array',
    ];
}
