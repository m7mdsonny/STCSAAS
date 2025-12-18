<?php

namespace App\Models;

class EdgeServer extends BaseModel
{
    protected $table = 'edge_servers';

    protected $casts = [
        'online' => 'boolean',
        'system_info' => 'array',
        'last_seen_at' => 'datetime',
    ];
}
