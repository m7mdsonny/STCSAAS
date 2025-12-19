<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('update_packages', function (Blueprint $table) {
            $table->id();
            $table->string('version');
            $table->string('title')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('target_all')->default(true);
            $table->json('target_organizations')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('update_packages');
    }
};
