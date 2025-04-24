<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function myOrders(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'buyer') {
            $orders = Order::with(['product', 'product.seller'])
                ->where('buyer_id', $user->id)
                ->latest()
                ->get();
        } else { // seller
            $orders = Order::with(['product', 'buyer'])
                ->whereHas('product', function ($query) use ($user) {
                    $query->where('seller_id', $user->id);
                })
                ->latest()
                ->get();
        }

        return response()->json($orders);
    }

    /**
     * Store a newly created order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();
        
        if ($user->role !== 'buyer') {
            return response()->json(['message' => 'Only buyers can place orders'], 403);
        }

        $product = Product::findOrFail($request->product_id);
        
        if ($product->status !== 'available') {
            return response()->json(['message' => 'This product is no longer available'], 400);
        }

        // Create the order
        $order = Order::create([
            'buyer_id' => $user->id,
            'product_id' => $product->id,
            'status' => 'pending',
        ]);

        // Update product status
        $product->status = 'sold';
        $product->save();

        $order->load(['product', 'product.seller']);
        
        return response()->json($order, 201);
    }

    /**
     * Display the specified order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        
        // Check if the user is authorized to view this order
        if ($user->role === 'buyer' && $order->buyer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } else if ($user->role === 'seller' && $order->product->seller_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->load(['product', 'product.seller', 'buyer']);
        
        return response()->json($order);
    }

    /**
     * Update the specified order status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
        ]);

        $user = $request->user();
        
        // Check if the user is authorized to update this order
        if ($user->role === 'buyer' && $order->buyer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } else if ($user->role === 'seller' && $order->product->seller_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow certain status changes based on role
        if ($user->role === 'buyer' && $request->status === 'completed') {
            return response()->json(['message' => 'Buyers cannot mark orders as completed'], 403);
        } else if ($user->role === 'seller' && $request->status === 'cancelled' && $order->status === 'completed') {
            return response()->json(['message' => 'Cannot cancel a completed order'], 403);
        }

        $order->status = $request->status;
        $order->save();

        // If order is cancelled, make the product available again
        if ($request->status === 'cancelled') {
            $product = $order->product;
            $product->status = 'available';
            $product->save();
        }

        $order->load(['product', 'product.seller', 'buyer']);
        
        return response()->json($order);
    }
}