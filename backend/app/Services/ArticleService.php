<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ArticleService
{
    /**
     * Get paginated list of articles
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getArticles(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Article::query()->with(['originalArticle', 'updatedVersions']);

        // Filter by version type
        if (!empty($filters['version_type'])) {
            $query->where('version_type', $filters['version_type']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by author
        if (!empty($filters['author'])) {
            $query->where('author', 'like', '%' . $filters['author'] . '%');
        }

        // Search by title
        if (!empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        // Sort order
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Get a single article by ID
     *
     * @param int $id
     * @return Article|null
     */
    public function getArticle(int $id): ?Article
    {
        return Article::with(['originalArticle', 'updatedVersions'])->find($id);
    }

    /**
     * Get the most recent original article
     *
     * @return Article|null
     */
    public function getLatestOriginalArticle(): ?Article
    {
        return Article::original()
            ->orderBy('created_at', 'desc')
            ->first();
    }

    /**
     * Create a new article
     *
     * @param array $data
     * @return Article
     */
    public function createArticle(array $data): Article
    {
        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Ensure unique slug
        $data['slug'] = $this->ensureUniqueSlug($data['slug']);

        // Set defaults
        $data['version_type'] = $data['version_type'] ?? Article::VERSION_ORIGINAL;
        $data['status'] = $data['status'] ?? Article::STATUS_DRAFT;

        return Article::create($data);
    }

    /**
     * Update an existing article
     *
     * @param int $id
     * @param array $data
     * @return Article|null
     */
    public function updateArticle(int $id, array $data): ?Article
    {
        $article = Article::find($id);

        if (!$article) {
            return null;
        }

        // If slug is being updated, ensure it's unique
        if (!empty($data['slug']) && $data['slug'] !== $article->slug) {
            $data['slug'] = $this->ensureUniqueSlug($data['slug'], $id);
        }

        $article->update($data);

        return $article->fresh(['originalArticle', 'updatedVersions']);
    }

    /**
     * Delete an article
     *
     * @param int $id
     * @return bool
     */
    public function deleteArticle(int $id): bool
    {
        $article = Article::find($id);

        if (!$article) {
            return false;
        }

        return $article->delete();
    }

    /**
     * Create an updated version of an article
     *
     * @param int $originalArticleId
     * @param array $data
     * @return Article|null
     */
    public function createUpdatedVersion(int $originalArticleId, array $data): ?Article
    {
        $originalArticle = Article::find($originalArticleId);

        if (!$originalArticle) {
            return null;
        }

        $data['original_article_id'] = $originalArticleId;
        $data['version_type'] = Article::VERSION_UPDATED;
        
        // Generate a new unique slug for the updated version
        $baseSlug = $data['slug'] ?? $originalArticle->slug . '-updated';
        $data['slug'] = $this->ensureUniqueSlug($baseSlug);

        return Article::create($data);
    }

    /**
     * Ensure a slug is unique by appending a counter if necessary
     *
     * @param string $slug
     * @param int|null $excludeId
     * @return string
     */
    private function ensureUniqueSlug(string $slug, ?int $excludeId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (true) {
            $query = Article::where('slug', $slug);
            
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            if (!$query->exists()) {
                break;
            }

            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
