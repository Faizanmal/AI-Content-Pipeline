<?php

namespace App\Jobs;

use App\Models\Article;
use App\Services\ArticleService;
use App\Services\ScraperService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ScrapeArticlesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(ScraperService $scraperService, ArticleService $articleService): void
    {
        Log::info('ScrapeArticlesJob started');

        try {
            // Scrape the 5 oldest articles from 
            $scrapedArticles = $scraperService->scrapeOldestArticles();

            if (empty($scrapedArticles)) {
                Log::warning('No articles were scraped');
                return;
            }

            Log::info('Scraped ' . count($scrapedArticles) . ' articles');

            foreach ($scrapedArticles as $articleData) {
                // Check if article already exists by source URL or slug
                $existingArticle = Article::where('source_url', $articleData['source_url'])
                    ->orWhere('slug', $articleData['slug'])
                    ->first();

                if ($existingArticle) {
                    Log::info("Article already exists: {$articleData['title']}");
                    continue;
                }

                // Create the article
                $article = $articleService->createArticle([
                    'title' => $articleData['title'],
                    'slug' => $articleData['slug'],
                    'published_date' => $articleData['published_date'],
                    'author' => $articleData['author'],
                    'content' => $articleData['content'] ?? '',
                    'source_url' => $articleData['source_url'],
                    'version_type' => Article::VERSION_ORIGINAL,
                    'status' => Article::STATUS_PUBLISHED,
                ]);

                Log::info("Created article: {$article->title} (ID: {$article->id})");
            }

            Log::info('ScrapeArticlesJob completed successfully');
        } catch (\Exception $e) {
            Log::error('ScrapeArticlesJob failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ScrapeArticlesJob failed permanently: ' . $exception->getMessage());
    }
}
