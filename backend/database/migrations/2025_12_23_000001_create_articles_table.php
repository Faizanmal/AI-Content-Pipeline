<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->date('published_date')->nullable();
            $table->string('author')->nullable();
            $table->longText('content'); // Full HTML or cleaned article content
            $table->string('source_url')->nullable();
            
            // Version tracking
            $table->unsignedBigInteger('original_article_id')->nullable();
            $table->enum('version_type', ['original', 'updated'])->default('original');
            $table->enum('status', ['draft', 'published'])->default('draft');
            
            // Metadata fields (JSON)
            $table->json('metadata')->nullable(); // For storing additional data like references
            
            $table->timestamps();
            
            // Foreign key for linking updated articles to originals
            $table->foreign('original_article_id')
                  ->references('id')
                  ->on('articles')
                  ->onDelete('set null');
            
            // Indexes for performance
            $table->index('version_type');
            $table->index('status');
            $table->index('published_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
