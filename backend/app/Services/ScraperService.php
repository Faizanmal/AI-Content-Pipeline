<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;

class ScraperService
{
    /**
     * Base URL for  blog
     */
    private const BLOG_BASE_URL = 'https://.com/blogs/';

    /**
     * Scrape the 5 oldest articles from  blog
     *
     * @return array
     */
    public function scrapeOldestArticles(): array
    {
        try {
            Log::info('Starting to scrape  blog');

            // First, get the last page of pagination
            $lastPage = $this->findLastPage();
            Log::info("Found last page: {$lastPage}");

            // Get articles from the last page (oldest articles)
            $articles = $this->getArticlesFromPage($lastPage);

            // Sort by date (oldest first) and take 5
            usort($articles, function ($a, $b) {
                return strtotime($a['published_date'] ?? '1970-01-01') - strtotime($b['published_date'] ?? '1970-01-01');
            });

            $oldestArticles = array_slice($articles, 0, 5);
            Log::info('Successfully scraped ' . count($oldestArticles) . ' oldest articles');

            return $oldestArticles;
        } catch (\Exception $e) {
            Log::error('Error scraping  blog: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Find the last page of pagination
     *
     * @return int
     */
    private function findLastPage(): int
    {
        try {
            $response = Http::timeout(30)->get(self::BLOG_BASE_URL);
            
            if (!$response->successful()) {
                Log::warning('Failed to fetch blog page, defaulting to page 1');
                return 1;
            }

            $crawler = new Crawler($response->body());
            
            // Try to find pagination links
            $paginationLinks = $crawler->filter('.pagination a, .page-numbers a, nav.pagination a, .wp-pagenavi a, a[href*="page"]');
            
            $lastPage = 1;
            $paginationLinks->each(function (Crawler $node) use (&$lastPage) {
                $href = $node->attr('href');
                $text = trim($node->text());
                
                // Check for page numbers in URL
                if (preg_match('/page[\/=](\d+)/i', $href, $matches)) {
                    $pageNum = (int) $matches[1];
                    if ($pageNum > $lastPage) {
                        $lastPage = $pageNum;
                    }
                }
                
                // Check for numeric text content
                if (is_numeric($text) && (int)$text > $lastPage) {
                    $lastPage = (int)$text;
                }
            });

            return $lastPage;
        } catch (\Exception $e) {
            Log::warning('Error finding last page: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Get articles from a specific page
     *
     * @param int $page
     * @return array
     */
    private function getArticlesFromPage(int $page): array
    {
        $url = $page === 1 ? self::BLOG_BASE_URL : self::BLOG_BASE_URL . "page/{$page}/";
        
        $response = Http::timeout(30)->get($url);
        
        if (!$response->successful()) {
            Log::error("Failed to fetch page {$page}");
            return [];
        }

        $crawler = new Crawler($response->body());
        $articles = [];

        // Try multiple selectors for blog posts
        $postSelectors = [
            'article',
            '.post',
            '.blog-post',
            '.entry',
            '.hentry',
            '[class*="post"]',
            'h2 a', // Add h2 a for titles
        ];

        $articles = [];

        foreach ($postSelectors as $selector) {
            try {
                $posts = $crawler->filter($selector);
                if ($posts->count() > 0) {
                    if ($selector === 'h2 a') {
                        // Special handling for h2 a
                        $posts->each(function (Crawler $node) use (&$articles) {
                            $article = $this->extractArticleDataFromLink($node);
                            if ($article && !empty($article['title']) && !empty($article['source_url'])) {
                                $articles[] = $article;
                            }
                        });
                    } else {
                        $posts->each(function (Crawler $node) use (&$articles) {
                            $article = $this->extractArticleData($node);
                            if ($article && !empty($article['title']) && !empty($article['source_url'])) {
                                $articles[] = $article;
                            }
                        });
                    }
                    
                    if (count($articles) > 0) {
                        break;
                    }
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        // Fetch full content for each article
        foreach ($articles as &$article) {
            if (!empty($article['source_url'])) {
                $fullContent = $this->scrapeArticleContent($article['source_url']);
                if ($fullContent) {
                    $article['content'] = $fullContent['content'];
                    if (empty($article['author']) && !empty($fullContent['author'])) {
                        $article['author'] = $fullContent['author'];
                    }
                }
            }
        }

        return $articles;
    }

    /**
     * Extract article data from a post element
     *
     * @param Crawler $node
     * @return array|null
     */
    private function extractArticleData(Crawler $node): ?array
    {
        try {
            $data = [
                'title' => null,
                'slug' => null,
                'published_date' => null,
                'author' => null,
                'content' => null,
                'source_url' => null,
            ];

            // Extract title
            $titleSelectors = ['h1 a', 'h2 a', 'h3 a', '.entry-title a', '.post-title a', 'a.title'];
            foreach ($titleSelectors as $selector) {
                try {
                    $titleNode = $node->filter($selector)->first();
                    if ($titleNode->count() > 0) {
                        $data['title'] = trim($titleNode->text());
                        $data['source_url'] = $titleNode->attr('href');
                        break;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            // If no link found in title, try direct links
            if (empty($data['source_url'])) {
                try {
                    $link = $node->filter('a')->first();
                    if ($link->count() > 0) {
                        $data['source_url'] = $link->attr('href');
                        if (empty($data['title'])) {
                            $data['title'] = trim($link->text());
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore
                }
            }

            // Generate slug from URL or title
            if (!empty($data['source_url'])) {
                $urlParts = parse_url($data['source_url']);
                $path = trim($urlParts['path'] ?? '', '/');
                $data['slug'] = basename($path) ?: \Illuminate\Support\Str::slug($data['title'] ?? 'article');
            } elseif (!empty($data['title'])) {
                $data['slug'] = \Illuminate\Support\Str::slug($data['title']);
            }

            // Extract date
            $dateSelectors = ['time', '.date', '.published', '.post-date', '.entry-date', '[datetime]'];
            foreach ($dateSelectors as $selector) {
                try {
                    $dateNode = $node->filter($selector)->first();
                    if ($dateNode->count() > 0) {
                        $dateStr = $dateNode->attr('datetime') ?: $dateNode->text();
                        $timestamp = strtotime($dateStr);
                        if ($timestamp !== false) {
                            $data['published_date'] = date('Y-m-d', $timestamp);
                            break;
                        }
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            // Extract author
            $authorSelectors = ['.author', '.byline', '.post-author', '[rel="author"]', '.author-name'];
            foreach ($authorSelectors as $selector) {
                try {
                    $authorNode = $node->filter($selector)->first();
                    if ($authorNode->count() > 0) {
                        $data['author'] = trim($authorNode->text());
                        break;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            // Extract excerpt/content
            $contentSelectors = ['.excerpt', '.entry-summary', '.post-content', '.entry-content', 'p'];
            foreach ($contentSelectors as $selector) {
                try {
                    $contentNode = $node->filter($selector)->first();
                    if ($contentNode->count() > 0) {
                        $data['content'] = trim($contentNode->html());
                        break;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            return $data;
        } catch (\Exception $e) {
            Log::warning('Error extracting article data: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Scrape full article content from URL
     *
     * @param string $url
     * @return array|null
     */
    public function scrapeArticleContent(string $url): ?array
    {
        try {
            $response = Http::timeout(30)->get($url);
            
            if (!$response->successful()) {
                Log::warning("Failed to fetch article: {$url}");
                return null;
            }

            $crawler = new Crawler($response->body());
            
            $result = [
                'content' => null,
                'author' => null,
            ];

            // Extract main content
            $contentSelectors = [
                'article .entry-content',
                '.post-content',
                '.article-content',
                '.entry-content',
                'article',
                '.content',
                'main',
            ];

            foreach ($contentSelectors as $selector) {
                try {
                    $contentNode = $crawler->filter($selector)->first();
                    if ($contentNode->count() > 0) {
                        $result['content'] = $this->cleanContent($contentNode->html());
                        break;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            // Extract author
            $authorSelectors = ['.author', '.byline', '[rel="author"]', '.post-author'];
            foreach ($authorSelectors as $selector) {
                try {
                    $authorNode = $crawler->filter($selector)->first();
                    if ($authorNode->count() > 0) {
                        $result['author'] = trim($authorNode->text());
                        break;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            return $result;
        } catch (\Exception $e) {
            Log::error("Error scraping article content from {$url}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract article data from a link element (for sites where posts are h2 > a)
     *
     * @param Crawler $node
     * @return array|null
     */
    private function extractArticleDataFromLink(Crawler $node): ?array
    {
        $data = [];

        // Title and URL from the link
        $data['title'] = trim($node->text());
        $data['source_url'] = $node->attr('href');

        // Generate slug
        if (!empty($data['source_url'])) {
            $urlParts = parse_url($data['source_url']);
            $path = trim($urlParts['path'] ?? '', '/');
            $data['slug'] = basename($path) ?: \Illuminate\Support\Str::slug($data['title'] ?? 'article');
        }

        // For date and author, try to find them in the parent or following elements
        // Since the HTML has h2 > a, then author/date below, we can look for following text
        $parent = $node->parents()->first();
        if ($parent->count() > 0) {
            $text = $parent->text();
            // Extract date from text, assuming format like NOVEMBER 28, 2025
            if (preg_match('/([A-Z]+ \d{1,2}, \d{4})/i', $text, $matches)) {
                $data['published_date'] = date('Y-m-d', strtotime($matches[1]));
            }
            // Author might be before the date
            if (preg_match('/by ([^\n\r]+)/i', $text, $matches)) {
                $data['author'] = trim($matches[1]);
            }
        }

        // Get full content from the article page
        if (!empty($data['source_url'])) {
            $fullContent = $this->scrapeArticleContent($data['source_url']);
            if ($fullContent) {
                $data['content'] = $fullContent['content'];
                if (empty($data['author']) && !empty($fullContent['author'])) {
                    $data['author'] = $fullContent['author'];
                }
                if (empty($data['published_date']) && !empty($fullContent['published_date'])) {
                    $data['published_date'] = $fullContent['published_date'];
                }
            }
        }

        return $data;
    }

    /**
     * Clean HTML content by removing unwanted elements
     *
     * @param string $html
     * @return string
     */
    public function cleanContent(string $html): string
    {
        $crawler = new Crawler($html);

        // Remove unwanted elements
        $removeSelectors = [
            'script',
            'style',
            'nav',
            'header',
            'footer',
            '.advertisement',
            '.ads',
            '.social-share',
            '.social-media',
            '.social-icons',
            '.share-buttons',
            '.follow-us',
            '.social-links',
            '.comments',
            '.related-posts',
            '.sidebar',
            '.widget',
            '.newsletter',
            '.subscribe',
        ];

        foreach ($removeSelectors as $selector) {
            try {
                $crawler->filter($selector)->each(function (Crawler $node) {
                    $domNode = $node->getNode(0);
                    if ($domNode && $domNode->parentNode) {
                        $domNode->parentNode->removeChild($domNode);
                    }
                });
            } catch (\Exception $e) {
                continue;
            }
        }

        return trim($crawler->html());
    }
}
