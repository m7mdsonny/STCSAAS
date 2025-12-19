<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_commands', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('command_type');
            $table->json('payload')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('is_template')->default(false);
            $table->boolean('target_all')->default(true);
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('ai_command_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_command_id')->constrained('ai_commands')->cascadeOnDelete();
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->unsignedBigInteger('edge_server_id')->nullable();
            $table->string('camera_group')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('ai_command_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_command_id')->constrained('ai_commands')->cascadeOnDelete();
            $table->string('status');
            $table->text('message')->nullable();
            $table->json('response')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_command_logs');
        Schema::dropIfExists('ai_command_targets');
        Schema::dropIfExists('ai_commands');
    }
};
