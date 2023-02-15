<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cover extends Model
{
    use HasFactory;
    protected $fillable = ['path'];

    public function readables()
    {
        return $this->hasMany(Readable::class);
    }
}