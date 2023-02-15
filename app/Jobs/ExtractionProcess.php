<?php

namespace App\Jobs;

use App\Constants;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Lib\Archiver;
use App\Models\Readable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ExtractionProcess implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $readable;
    public $dir_path;
    public $callback;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Readable $readable, $dir_path, $callback = null)
    {
        $this->readable = $readable;
        $this->dir_path = $dir_path;
        $this->callback = $callback;
        $readable->update(['status' => Constants::QUEUED]);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->readable->update(['status' => Constants::EXTRACTING]);
        $readable = $this->readable;
        Archiver::open(Storage::disk('comics')->path($this->readable->path))->extractAllIn($this->dir_path,function($i, $file) use ($readable) {File::extension($file) && $readable->images()->create(['page_number' => $i+1, 'path' => "$readable->id/$file"]);} );
        if($this->callback) ($this->callback)();  
        $this->readable->update(['status' => Constants::EXTRACTED]);
    }


    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        $this->readable->update(['status' => Constants::FAILED]);
        File::deleteDirectory(Storage::disk('cache')->path($this->readable->id));
        Log::alert("Failed to extract $this->readable->id", ['exception' => $exception]);
    }

    public function uniqueId(){
        return $this->readable->id;
    }

    public static function stillGoing($readable = null){
        return DB::table('jobs')
            ->where('payload', 'LIKE', '%ExtractionProcess%')
            ->where('payload', 'LIKE', $readable ? '%cache%'.($readable->id).'%' : '%%')
            ->exists();
    }
}

