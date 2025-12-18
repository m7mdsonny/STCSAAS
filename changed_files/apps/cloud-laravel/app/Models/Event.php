<?php

namespace App\Models;

class Event extends BaseModel
{
    protected $table = 'events';
    protected $casts = [
        'meta' => 'array',
        'occurred_at' => 'datetime',
    ];
}
