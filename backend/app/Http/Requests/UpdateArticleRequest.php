<?php

namespace App\Http\Requests;

use App\Models\Article;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateArticleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $articleId = $this->route('article');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('articles')->ignore($articleId)],
            'published_date' => ['nullable', 'date'],
            'author' => ['nullable', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'source_url' => ['nullable', 'url', 'max:500'],
            'original_article_id' => ['nullable', 'exists:articles,id'],
            'version_type' => ['nullable', Rule::in([Article::VERSION_ORIGINAL, Article::VERSION_UPDATED])],
            'status' => ['nullable', Rule::in([Article::STATUS_DRAFT, Article::STATUS_PUBLISHED])],
            'metadata' => ['nullable', 'array'],
            'metadata.references' => ['nullable', 'array'],
            'metadata.references.*.title' => ['required_with:metadata.references', 'string'],
            'metadata.references.*.url' => ['required_with:metadata.references', 'url'],
            'metadata.references.*.domain' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The article title is required.',
            'slug.unique' => 'An article with this slug already exists.',
            'content.required' => 'The article content is required.',
            'original_article_id.exists' => 'The referenced original article does not exist.',
        ];
    }
}
