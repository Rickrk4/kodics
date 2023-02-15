<?php

namespace Database\Seeders;

use App\Jobs\ClearCacheProcess;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Lib\RecursiveScraper as Scraper;
use App\Models\Cover;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        ClearCacheProcess::dispatchSync();
        File::deleteDirectories(Storage::disk('cache')->path(''));
        File::makeDirectory(Storage::disk('cache')->path('cover'), $mode = 0777, true, true); 
        Cover::create(['path' => 'app/public/default.jpg']);
        Scraper::scrape();
        $this->call([
            ReadableSeeder::class
        ]);
    }
}
