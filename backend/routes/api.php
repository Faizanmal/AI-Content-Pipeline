<?php

use App\Http\Controllers\Api\ArticleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// Article CRUD routes
Route::prefix('articles')->group(function () {
    Route::get('/', [ArticleController::class, 'index']);
    Route::post('/', [ArticleController::class, 'store']);
    Route::get('/latest', [ArticleController::class, 'latest']);
    Route::get('/{id}', [ArticleController::class, 'show'])->where('id', '[0-9]+');
    Route::put('/{id}', [ArticleController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/{id}', [ArticleController::class, 'destroy'])->where('id', '[0-9]+');
    
    // Scraping endpoint
    Route::post('/scrape', [ArticleController::class, 'scrape']);
});
