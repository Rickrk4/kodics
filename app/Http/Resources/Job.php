<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Job extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'progress' => $this->progress,
            'progressTotal' => $this->total,
            'progressPercentage' => $this->progress && $this->total ? $this->progress / $this->total * 100 : null,
            'payload' => $this->payload,
        ];;
    }
}
