<?php

namespace App\Jobs;

use App\Constants;
use App\Models\Readable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;


use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ClearCacheProcess implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $days;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $days = 0)
    {
        $this->days = $days;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {   
        $readables = Readable::where('last_read', '<=', Carbon::now()->subDays($this->days))->where('status', Constants::EXTRACTED)->get();
        foreach ($readables as $readable) {
            error_log("cleaning cache of $readable->id");
            $readable->clearCache();
            $readable->update(['status' => Constants::READY]);
        }
    }
}
