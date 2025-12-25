<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Resources\ArticleCollection;
use App\Http\Resources\ArticleResource;
use App\Jobs\ScrapeArticlesJob;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function __construct(
        private ArticleService $articleService
    ) {}

    /**
     * Display a listing of articles.
     *
     * @param Request $request
     * @return ArticleCollection
     */
    public function index(Request $request): ArticleCollection
    {
        $filters = [
            'version_type' => $request->get('version_type'),
            'status' => $request->get('status'),
            'author' => $request->get('author'),
            'search' => $request->get('search'),
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_order' => $request->get('sort_order', 'desc'),
        ];

        $perPage = (int) $request->get('per_page', 15);
        
        $articles = $this->articleService->getArticles($filters, $perPage);

        return new ArticleCollection($articles);
    }

    /**
     * Store a newly created article.
     *
     * @param StoreArticleRequest $request
     * @return JsonResponse
     */
    public function store(StoreArticleRequest $request): JsonResponse
    {
        $article = $this->articleService->createArticle($request->validated());

        return response()->json([
            'message' => 'Article created successfully',
            'data' => new ArticleResource($article),
        ], 201);
    }

    /**
     * Display the specified article.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $article = $this->articleService->getArticle($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article not found',
            ], 404);
        }

        return response()->json([
            'data' => new ArticleResource($article),
        ]);
    }

    /**
     * Update the specified article.
     *
     * @param UpdateArticleRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateArticleRequest $request, int $id): JsonResponse
    {
        $article = $this->articleService->updateArticle($id, $request->validated());

        if (!$article) {
            return response()->json([
                'message' => 'Article not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Article updated successfully',
            'data' => new ArticleResource($article),
        ]);
    }

    /**
     * Remove the specified article.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->articleService->deleteArticle($id);

        if (!$deleted) {
            return response()->json([
                'message' => 'Article not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Article deleted successfully',
        ]);
    }

    /**
     * Get the latest original article.
     *
     * @return JsonResponse
     */
    public function latest(): JsonResponse
    {
        $article = $this->articleService->getLatestOriginalArticle();

        if (!$article) {
            return response()->json([
                'message' => 'No original articles found',
            ], 404);
        }

        return response()->json([
            'data' => new ArticleResource($article),
        ]);
    }

    /**
     * Trigger scraping of articles from .
     *
     * @return JsonResponse
     */
    public function scrape(): JsonResponse
    {
        ScrapeArticlesJob::dispatch();

        return response()->json([
            'message' => 'Scraping job has been queued',
        ], 202);
    }
}
