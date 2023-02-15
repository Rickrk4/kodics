<?php

namespace App\Http\Resources;

use Illuminate\Support\Facades\File;
use Illuminate\Http\Resources\Json\JsonResource;

class Readable extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {   $id = $this->id;
        return [
            'id' => $this->id,
            'title' => $this->title,
            'ext' => File::extension($this->path),
            'cover_url' => '/api/readables/'.$this->id.'/cover',
            'parent' => $this->readable_id,
            'children' => $this->children()->pluck('id'),
            'images' => $this->images->pluck('page_number')->map(function($page_number) use ($id){return 'api/readables/'.$id.'/image/'.$page_number;}),
            'status' => $this->status,
        ];
    }
}
