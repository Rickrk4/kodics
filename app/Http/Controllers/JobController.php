<?php

namespace App\Http\Controllers;

use App\Http\Resources\Job as ResourcesJob;
use App\Jobs\ClearCacheProcess;
use App\Jobs\ExtractionProcess;
use App\Jobs\ScraperProcess;
use App\Models\Job;
use App\Models\Readable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class JobController extends Controller
{
    private $_jobs = ['scrape' => ScraperProcess::class];


    public function index()
    {
        return ResourcesJob::collection(Job::where('payload', 'LIKE', '%ScraperProcess%')->get());
    }

    public function show(Job $job)
    {   
        return new ResourcesJob($job);
    }

    public function create(Request $request)
    {   
        return new ResourcesJob($this->_jobs[$request->input('job','scrape')]::create($request->input('folder','comics')));
    }

    private function readLog($file, $lastpos = 0, $interval = 3000000){
        while (true) {
            usleep($interval); //3 s
            clearstatcache(false, $file);
            $len = filesize($file);
            if ($len < $lastpos) {
                //file deleted or reset
                $lastpos = $len;
            }
            elseif ($len > $lastpos) {
                $f = fopen($file, "rb");
                if ($f === false)
                    die();
                fseek($f, $lastpos);
                while (!feof($f)) {
                    $buffer = fread($f, 4096);
                    echo $buffer;
                    flush();
                }
                $lastpos = ftell($f);
                fclose($f);
            }
        }
    }

    public function Scrape()
    {
        ScraperProcess::dispatch('comics');
        ScraperProcess::dispatch('books');
    }

    public function ScrapeGoing(){
        //return DB::table('jobs')
        //    ->where('payload', 'LIKE', '%ScraperProcess%')
        //    ->first();
        return ScraperProcess::stillGoing() ? 1:0;
    }

    public function Extract(Readable $readable)
    {
        $dir_path = Storage::path('cache/' . $readable->id);
        ExtractionProcess::dispatch($readable, $dir_path);
    }

    public function ClearCache(){
        ClearCacheProcess::dispatch(0);
    }
}
