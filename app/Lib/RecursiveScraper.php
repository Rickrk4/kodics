<?php

namespace App\Lib;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use App\Lib\Archiver;
use App\Models\Cover;
use App\Models\Readable;
use Illuminate\Support\Facades\Log;

class RecursiveScraper {

    private static function getParent(Readable $readable): Readable|null{
        $parent_path = dirname($readable->path, 1);
        if($parent_path == '' || $parent_path == '/' || $parent_path == "." || $parent_path == "")
            return null; 
        $parent = Readable::firstOrNew([
                        'title' => basename($parent_path, 1),
                        'path'  => dirname($readable->path, 1),
                    ]);
        $parent->cover()->associate($readable->cover);
        if(!$parent->parent){
            $parent->parent()->associate(RecursiveScraper::getParent($parent));
            $parent->save();
        }
        return $parent;
    }

    
    private static function extractCover($file)
    {
        Archiver::open($file)->extractFirstIn(Storage::disk("_cover")->path(''));
        $file = Storage::disk('_cover')->path(Storage::disk("_cover")->allFiles()[0]);
        $_file_ = uniqid().'.'.File::extension($file);
        rename($file, Storage::disk('covers')->path($_file_));
        try{
            exec("rm -r /tmp/cover/*");
        } catch (\Exception $e){
        }
        return $_file_;
    }
    
    private static function getCover(Readable $readable): Cover|null {
        try {
            return Cover::create(['path' => RecursiveScraper::extractCover(Storage::disk('comics')->path($readable->path))]);   
        } catch (\Throwable $th) {                
            throw_unless($readable->isEpub(), $th);
            return Cover::first();
        }     
    }

    public static function scrape(string $path = 'comics', $progress_callback = null)
    {
        $files = Storage::disk($path)->allFiles();
        $files = array_filter($files, function($file)use($path){return Archiver::support(Storage::disk($path)->path($file));});
        $n = count($files);

        foreach ($files as $i => $file) {
            if(Readable::where('path', $file)->exists()) continue; //This prevent update of files.
            Log::channel("scraper")->info("extract $file");
            try{
                $readable = new Readable([
                            'title' => basename($file),
                            'path' => "$file",
                        ]);
                $readable->cover()->associate(RecursiveScraper::getCover($readable));
                $readable->parent()->associate(RecursiveScraper::getParent($readable));
                $readable->save();
            } catch (\Exception $e){
                Log::channel("scraper")->alert("Cannot scrape $file", ['exception' => $e]);
            } finally {
                Log::channel("scraper")->info($file . " done");
            }
            $progress_callback && $progress_callback($i, $n);
        }
    }

}

?>
