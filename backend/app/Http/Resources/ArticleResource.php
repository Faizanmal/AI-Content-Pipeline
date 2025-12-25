<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'published_date' => $this->published_date?->format('Y-m-d'),
            'author' => $this->author,
            'content' => $this->content,
            'source_url' => $this->source_url,
            'version_type' => $this->version_type,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'references' => $this->getReferences(),
            'original_article_id' => $this->original_article_id,
            'original_article' => new ArticleResource($this->whenLoaded('originalArticle')),
            'updated_versions' => ArticleResource::collection($this->whenLoaded('updatedVersions')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
