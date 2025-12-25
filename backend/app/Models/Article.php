<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'slug',
        'published_date',
        'author',
        'content',
        'source_url',
        'original_article_id',
        'version_type',
        'status',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'published_date' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Version type constants
     */
    const VERSION_ORIGINAL = 'original';
    const VERSION_UPDATED = 'updated';

    /**
     * Status constants
     */
    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';

    /**
     * Get the original article (if this is an updated version)
     */
    public function originalArticle(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'original_article_id');
    }

    /**
     * Get all updated versions of this article
     */
    public function updatedVersions(): HasMany
    {
        return $this->hasMany(Article::class, 'original_article_id');
    }

    /**
     * Scope to filter original articles only
     */
    public function scopeOriginal($query)
    {
        return $query->where('version_type', self::VERSION_ORIGINAL);
    }

    /**
     * Scope to filter updated articles only
     */
    public function scopeUpdated($query)
    {
        return $query->where('version_type', self::VERSION_UPDATED);
    }

    /**
     * Scope to filter published articles only
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    /**
     * Scope to filter draft articles only
     */
    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Check if article is original
     */
    public function isOriginal(): bool
    {
        return $this->version_type === self::VERSION_ORIGINAL;
    }

    /**
     * Check if article is updated
     */
    public function isUpdated(): bool
    {
        return $this->version_type === self::VERSION_UPDATED;
    }

    /**
     * Check if article is published
     */
    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }

    /**
     * Get references from metadata
     */
    public function getReferences(): array
    {
        return $this->metadata['references'] ?? [];
    }
}
