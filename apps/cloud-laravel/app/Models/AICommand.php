<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class AICommand extends BaseModel
{
    protected $table = 'ai_commands';

    protected $casts = [
        'payload' => 'array',
        'target_all' => 'boolean',
        'is_template' => 'boolean',
        'scheduled_at' => 'datetime',
        'last_attempt_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function targets(): HasMany
    {
        return $this->hasMany(AICommandTarget::class, 'ai_command_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AICommandLog::class, 'ai_command_id');
    }
}
