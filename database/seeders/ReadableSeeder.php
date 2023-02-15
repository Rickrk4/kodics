<?php

namespace Database\Seeders;

use App\Models\Cover;
use App\Models\Readable;
use App\Models\Image;

use App\Lib\Archiver;
use App\Lib\Scraper;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ReadableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //Cover::create(['path' => 'public/default.jpg']);
        Scraper::scrape();
    }
}
