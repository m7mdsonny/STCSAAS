<?php

namespace App\Models;

class UpdateAnnouncement extends BaseModel
{
    protected $table = 'updates';

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];
}
