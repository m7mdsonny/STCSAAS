<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('updates', function (Blueprint $table) {
            // Version fields
            $table->string('version')->nullable()->after('title');
            $table->enum('version_type', ['major', 'minor', 'patch', 'hotfix'])->nullable()->after('version');
            $table->text('release_notes')->nullable()->after('body');
            $table->text('changelog')->nullable()->after('release_notes');
            $table->json('affected_modules')->nullable()->after('changelog');
            $table->boolean('requires_manual_update')->default(false)->after('affected_modules');
            $table->string('download_url')->nullable()->after('requires_manual_update');
            $table->string('checksum')->nullable()->after('download_url');
            $table->integer('file_size_mb')->nullable()->after('checksum');
            $table->timestamp('release_date')->nullable()->after('published_at');
            $table->timestamp('end_of_support_date')->nullable()->after('release_date');
        });
    }

    public function down(): void
    {
        Schema::table('updates', function (Blueprint $table) {
            $table->dropColumn([
                'version',
                'version_type',
                'release_notes',
                'changelog',
                'affected_modules',
                'requires_manual_update',
                'download_url',
                'checksum',
                'file_size_mb',
                'release_date',
                'end_of_support_date',
            ]);
        });
    }
};

