<?php

namespace App\Http\Controllers;

use App\Models\Readable;
use App\Models\Cover;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CoverController extends Controller
{
    /**
     * Provision a new web server.
     *
     * @return \Illuminate\Http\Response
     */
    public function __invoke(Readable $readable, Cover $cover)
    {
        $cover = $readable->cover()->firstOrFail();
        $cover_path = Storage::disk('covers')->path($cover->path);
        if(!file_exists($cover_path))
            $cover_path = storage_path('app/public/default.jpg');
        return response()->file($cover_path);
    }

    public function index(Readable $readable)
    {
        return $readable->images;
    }

        /**
     * Provision a new web server.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(Readable $readable, Image $image)
    {
        return response()->file(Storage::disk('cache')->path($image->path));
    }
}
