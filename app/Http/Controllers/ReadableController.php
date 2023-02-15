<?php

namespace App\Http\Controllers;

use App\Constants;
use ZipArchive;
use RarArchive;
//use Imagick;
use App\Lib\Archiver;
use App\Models\Readable;
use Illuminate\Http\Request;
use App\Http\Resources\Readable as ReadableResource;
use App\Jobs\ExtractionProcess;
use Illuminate\Contracts\Cache\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ReadableController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {   
        $pN = $request->input('pN', 18);
        if ($q = $request->input('query'))
            return ReadableResource::collection(Readable::search($q)->paginate($pN));
        
        return ReadableResource::collection(Readable::where('readable_id', null)->paginate($pN));
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Readable  $readable
     * @return \Illuminate\Http\Response
     */
    public function show(Readable $readable, Request $request)
    {   
        $q = $request->input('query');
        // If readable is a folder than return its children.
        if ($readable->isDir())
            return ReadableResource::collection(($q ? Readable::search($q) : $readable->children())->paginate($request->input('pN', 18)));

        // Update last read.
        $readable->update(['last_read' => now()]);
        
        // If Readable is an epub
        if (File::extension($readable->path) == 'epub') 
            return response()->file(Storage::disk('comics')->path($readable->path));
        
        // If not extracted extract
        if ($readable->status == Constants::READY || $readable->status == Constants::FAILED)
            $readable->startExtractingIfNotExtracted();
        
        return new ReadableResource($readable); 
    }

}
