<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Article;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create a sample original article
        Article::create([
            'title' => 'Sample Original Article',
            'slug' => 'sample-original-article',
            'published_date' => now(),
            'author' => 'Test Author',
            'content' => 'This is a sample original article content for testing the enhancement pipeline.',
            'source_url' => 'https://example.com/sample-article',
            'version_type' => Article::VERSION_ORIGINAL,
            'status' => 'published',
            'metadata' => ['tags' => ['sample', 'test']],
        ]);
    }
}
