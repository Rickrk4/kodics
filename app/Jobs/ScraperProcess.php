<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Lib\RecursiveScraper as Scraper;
use Illuminate\Support\Facades\DB;
use Throwable;

class ScraperProcess implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    private $folder;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(string $folder = 'comics')
    {
        $this->folder = $folder;
    }

    public function uniqueId()
    {
        return $this->folder;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Scraper::scrape($this->folder, function($i, $n){
            DB::table('jobs')
                ->where('payload', 'LIKE', '%ScraperProcess%')
                ->update(['progress' => $i, 'total' => $n]);
        });
    }

    public static function stillGoing(){
        return DB::table('jobs')
            ->where('payload', 'LIKE', '%ScraperProcess%')
            ->exists();
    }
    
    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        error_log($exception);
    }


    public static function create(string $folder = 'comics')
    {
        ScraperProcess::dispatch($folder);
        while(!($job = DB::table('jobs')
                ->where('payload', 'LIKE', '%ScraperProcess%')
                ->first()))
            sleep(1);
        return $job;
    }



}

