<?php

namespace App\Models;

use App\Helpers\RoleHelper;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $guarded = [];
    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'is_super_admin' => 'boolean',
    ];

    /**
     * Accessor to always return normalized role
     */
    public function getRoleAttribute($value): string
    {
        return RoleHelper::normalize($value ?? 'viewer');
    }

    /**
     * Mutator to normalize role when setting
     */
    public function setRoleAttribute($value): void
    {
        $this->attributes['role'] = RoleHelper::normalize($value ?? 'viewer');
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return RoleHelper::isSuperAdmin($this->role, $this->is_super_admin ?? false);
    }

    /**
     * Check if user can manage organization
     */
    public function canManageOrganization(): bool
    {
        return RoleHelper::canManageOrganization($this->role);
    }

    /**
     * Check if user can edit
     */
    public function canEdit(): bool
    {
        return RoleHelper::canEdit($this->role);
    }

    /**
     * Get role label
     */
    public function getRoleLabel(): string
    {
        return RoleHelper::getLabel($this->role);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get registered faces created by this user
     */
    public function createdRegisteredFaces()
    {
        return $this->hasMany(RegisteredFace::class, 'created_by');
    }

    /**
     * Get registered faces updated by this user
     */
    public function updatedRegisteredFaces()
    {
        return $this->hasMany(RegisteredFace::class, 'updated_by');
    }

    /**
     * Get registered vehicles created by this user
     */
    public function createdRegisteredVehicles()
    {
        return $this->hasMany(RegisteredVehicle::class, 'created_by');
    }

    /**
     * Get registered vehicles updated by this user
     */
    public function updatedRegisteredVehicles()
    {
        return $this->hasMany(RegisteredVehicle::class, 'updated_by');
    }
}
