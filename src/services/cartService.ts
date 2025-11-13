/**
 * Cart Service
 * Handles all API calls related to shopping cart
 */

import { get, post, patch, del } from '@/src/lib/apiClient';
import type {
  Cart,
  AddToCartDto,
  UpdateCartItemDto,
  Purchase,
  PaymentPreference,
} from '@/src/lib/types';

/**
 * Get all active carts for the logged-in user
 */
export async function getUserCarts(): Promise<Cart[]> {
  return get<Cart[]>('/carts');
}

/**
 * Get a specific cart by ID
 */
export async function getCartById(cartId: string): Promise<Cart> {
  return get<Cart>(`/carts/${cartId}`);
}

/**
 * Add item to cart
 * If a cart for the event doesn't exist, it will be created
 */
export async function addToCart(data: AddToCartDto): Promise<Cart> {
  return post<Cart, AddToCartDto>('/carts/items', data);
}

/**
 * Update quantity of a cart item
 */
export async function updateCartItem(cartItemId: string, data: UpdateCartItemDto): Promise<Cart> {
  return patch<Cart, UpdateCartItemDto>(`/carts/items/${cartItemId}`, data);
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(cartItemId: string): Promise<void> {
  return del<void>(`/carts/items/${cartItemId}`);
}

/**
 * Clear a cart (remove all items)
 */
export async function clearCart(cartId: string): Promise<void> {
  return del<void>(`/carts/${cartId}`);
}

/**
 * Checkout a cart (direct purchase without payment gateway)
 */
export async function checkoutCart(cartId: string): Promise<Purchase> {
  return post<Purchase>(`/carts/${cartId}/checkout`);
}

/**
 * Create Stripe checkout session for cart checkout
 */
export async function checkoutCartStripe(cartId: string): Promise<PaymentPreference> {
  return post<PaymentPreference>(`/carts/${cartId}/checkout/stripe`);
}
