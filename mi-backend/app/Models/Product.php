<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'price',
        'image_path',
        'seller_id',
        'status'
    ];

    /**
     * Get the seller of this product.
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the orders for this product.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get messages related to this product.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}