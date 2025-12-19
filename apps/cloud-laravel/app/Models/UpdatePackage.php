<?php

namespace App\Models;

class UpdatePackage extends BaseModel
{
    protected $table = 'update_packages';

    protected $casts = [
        'payload' => 'array',
        'target_organizations' => 'array',
        'target_all' => 'boolean',
        'applied_at' => 'datetime',
    ];
}
