<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add foreign keys for registered faces and vehicles
            $table->foreignId('registered_face_id')->nullable()->after('edge_server_id')
                ->constrained('registered_faces')->nullOnDelete();
            $table->foreignId('registered_vehicle_id')->nullable()->after('registered_face_id')
                ->constrained('registered_vehicles')->nullOnDelete();

            // Add indexes
            $table->index('registered_face_id');
            $table->index('registered_vehicle_id');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['registered_face_id']);
            $table->dropForeign(['registered_vehicle_id']);
            $table->dropIndex(['registered_face_id']);
            $table->dropIndex(['registered_vehicle_id']);
            $table->dropColumn(['registered_face_id', 'registered_vehicle_id']);
        });
    }
};

