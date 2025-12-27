<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends BaseModel
{
    protected $table = 'events';
    protected $casts = [
        'meta' => 'array',
        'occurred_at' => 'datetime',
    ];

    /**
     * Get the registered face associated with this event (if face recognition event)
     */
    public function registeredFace(): BelongsTo
    {
        return $this->belongsTo(RegisteredFace::class, 'registered_face_id');
    }

    /**
     * Get the registered vehicle associated with this event (if vehicle recognition event)
     */
    public function registeredVehicle(): BelongsTo
    {
        return $this->belongsTo(RegisteredVehicle::class, 'registered_vehicle_id');
    }

    /**
     * Get the organization that owns this event
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the edge server that generated this event
     */
    public function edgeServer(): BelongsTo
    {
        return $this->belongsTo(EdgeServer::class);
    }
}
