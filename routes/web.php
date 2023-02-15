<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReadableController;
use App\Http\Controllers\CoverController;
use App\Lib\Archiver;
use Illuminate\Support\Facades\Storage;
use Jcupitt\Vips;
Route::get('/test', function(){
    $file = storage_path('app/comics/Topolino 0977.pdf');
    Archiver::open($file)->extractFirstIn(Storage::disk("_cover")->path(''));
    $file = Storage::disk('_cover')->path(Storage::disk("_cover")->allFiles()[0]);
    //Vips\Image::newFromFile($file, ["dpi" => 30, "page" => 0])->writeToFile('/tmp/test.png');
    return $file;
    
});

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::prefix('api')->group(function () {
    Route::get('readables/{readable}.epub', [ReadableController::class, 'show']);
    Route::apiResource('readables', ReadableController::class)->only(['index', 'show']);
    Route::get('readables/{readable}/cover', CoverController::class);
    Route::apiResource('readables.image', CoverController::class)->only(['index', 'show'])
        ->scoped(['image' => 'page_number',]);
});

Route::get('/{type?}/{reader?}/{id?}', function () {
    return view('main');
});
