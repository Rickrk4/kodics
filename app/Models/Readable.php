<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Constants;
use App\Jobs\ExtractionProcess;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;
use Laravel\Scout\Searchable;

class Readable extends Model
{
    use HasFactory;
    use Searchable;
    protected $fillable = ['title', 'path', 'status', 'last_read'];
    public function cover()
    {
        return $this->belongsTo(Cover::class);
    }

    /**
     * Get the readable that owns the Readable
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function parent()
    {
        return $this->belongsTo(Readable::class, 'readable_id');
    }

    /**
     * Get all of the children for the Readable
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function children()
    {
        return $this->hasMany(Readable::class);
    }

    /**
     * Get all of the comments for the Readable
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    public function clearCache()
    {
        File::deleteDirectory(Storage::disk('cache')->path($this->id));
        $this->images()->delete();   
    }

    public function isDir(){
        return count($this->children) > 0;
    }
    
    public function isEpub()
    {
        return File::extension($this->path) == 'epub';
    }

    public function getType(){
        if ($this->isDir())
            return 'folder';
        if ($this->isEpub)
            return 'epub'; 
        return 'comic';
    }

    public function startExtractingIfNotExtracted(): void
    {
        if ($this->status == Constants::READY || $this->status == Constants::FAILED){
            #$this->update(['status' => Constants::EXTRACTING]);
            ExtractionProcess::dispatch($this, Storage::disk('cache')->path($this->id));
        }
    }
    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        return [
            'title' => (string) $this->title,
        ];  
    }
}
