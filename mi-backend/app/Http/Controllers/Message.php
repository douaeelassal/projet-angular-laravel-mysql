<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Get all messages for a specific product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductMessages(Request $request, $productId)
    {
        $user = $request->user();
        $product = Product::findOrFail($productId);
        
        // Check if the user is authorized to view these messages
        if ($product->seller_id !== $user->id && 
            !$product->orders()->where('buyer_id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $otherUserId = ($product->seller_id === $user->id) 
            ? $product->orders()->first()->buyer_id
            : $product->seller_id;
            
        $messages = Message::where('product_id', $productId)
            ->where(function ($query) use ($user, $otherUserId) {
                $query->where('sender_id', $user->id)->where('receiver_id', $otherUserId)
                    ->orWhere('sender_id', $otherUserId)->where('receiver_id', $user->id);
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at')
            ->get();
            
        return response()->json($messages);
    }

    /**
     * Store a newly created message.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $user = $request->user();
        $product = Product::findOrFail($request->product_id);
        $receiver = User::findOrFail($request->receiver_id);
        
        // Check if the user is authorized to send a message about this product
        $isSellerOrBuyer = $product->seller_id === $user->id || 
            $product->orders()->where('buyer_id', $user->id)->exists();
            
        if (!$isSellerOrBuyer) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Check if the receiver is authorized to receive a message about this product
        $isReceiverSellerOrBuyer = $product->seller_id === $receiver->id || 
            $product->orders()->where('buyer_id', $receiver->id)->exists();
            
        if (!$isReceiverSellerOrBuyer) {
            return response()->json(['message' => 'Invalid receiver'], 400);
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $request->receiver_id,
            'product_id' => $request->product_id,
            'content' => $request->content,
        ]);

        $message->load(['sender', 'receiver', 'product']);
        
        return response()->json($message, 201);
    }

    /**
     * Get all conversations for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConversations(Request $request)
    {
        $user = $request->user();
        
        $sentMessages = Message::where('sender_id', $user->id)
            ->select('product_id', 'receiver_id as other_user_id')
            ->distinct()
            ->get();
            
        $receivedMessages = Message::where('receiver_id', $user->id)
            ->select('product_id', 'sender_id as other_user_id')
            ->distinct()
            ->get();
            
        $conversations = $sentMessages->concat($receivedMessages)
            ->unique(function ($item) {
                return $item['product_id'].'-'.$item['other_user_id'];
            })
            ->values();
            
        // Load additional data
        foreach ($conversations as $conversation) {
            $conversation->product = Product::with('seller')->find($conversation->product_id);
            $conversation->other_user = User::find($conversation->other_user_id);
            $conversation->last_message = Message::where('product_id', $conversation->product_id)
                ->where(function ($query) use ($user, $conversation) {
                    $query->where('sender_id', $user->id)->where('receiver_id', $conversation->other_user_id)
                        ->orWhere('sender_id', $conversation->other_user_id)->where('receiver_id', $user->id);
                })
                ->latest()
                ->first();
        }
        
        return response()->json($conversations);
    }
}