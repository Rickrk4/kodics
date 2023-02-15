<?php

use App\Constants;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('readables', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('path');
            $table->foreignId('cover_id')->constrained();
            $table->foreignId('readable_id')->nullable()->constrained();
            $table->enum("status", Constants::JOB_STATES)->nullable()->default(Constants::READY);
            $table->timestamps();
            $table->date('last_read', $precision = 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('readables');
    }
};
