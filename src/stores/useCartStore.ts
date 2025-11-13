/**
 * Cart Store
 * Manages shopping cart state using Zustand
 */

import { create } from 'zustand';
import type { Cart, AddToCartDto, Purchase, PaymentPreference, ApiError } from '@/src/lib/types';
import * as cartService from '@/src/services/cartService';

// ============================================
// State and Actions Types
// ============================================

interface CartState {
  // List of user's carts (one per event)
  carts: Cart[];

  // Currently active cart (for viewing/editing)
  currentCart: Cart | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Total items across all carts
  totalItems: number;
}

interface CartActions {
  // Fetch all user's carts
  fetchCarts: () => Promise<void>;

  // Fetch a specific cart by ID
  fetchCartById: (cartId: string) => Promise<void>;

  // Add item to cart
  addItem: (data: AddToCartDto) => Promise<Cart>;

  // Update cart item quantity
  updateItemQuantity: (cartItemId: string, quantity: number) => Promise<Cart>;

  // Remove item from cart
  removeItem: (cartItemId: string) => Promise<void>;

  // Clear cart (remove all items)
  clearCart: (cartId: string) => Promise<void>;

  // Checkout cart (direct)
  checkout: (cartId: string) => Promise<Purchase>;

  // Checkout cart with Stripe
  checkoutStripe: (cartId: string) => Promise<PaymentPreference>;

  // Set current cart
  setCurrentCart: (cart: Cart | null) => void;

  // Clear error
  clearError: () => void;

  // Reset store
  reset: () => void;

  // Calculate total items
  calculateTotalItems: () => void;
}

type CartStore = CartState & CartActions;

// ============================================
// Initial State
// ============================================

const initialState: CartState = {
  carts: [],
  currentCart: null,
  isLoading: false,
  error: null,
  totalItems: 0,
};

// ============================================
// Create Store
// ============================================

export const useCartStore = create<CartStore>((set, get) => ({
  ...initialState,

  // Fetch all user's carts
  fetchCarts: async () => {
    try {
      set({ isLoading: true, error: null });

      const carts = await cartService.getUserCarts();

      set({
        carts,
        isLoading: false,
      });

      // Calculate total items
      get().calculateTotalItems();
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al cargar los carritos',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch a specific cart by ID
  fetchCartById: async (cartId) => {
    try {
      set({ isLoading: true, error: null });

      const cart = await cartService.getCartById(cartId);

      set({
        currentCart: cart,
        isLoading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al cargar el carrito',
        isLoading: false,
      });
      throw error;
    }
  },

  // Add item to cart
  addItem: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const updatedCart = await cartService.addToCart(data);

      // Update carts list
      set((state) => {
        const existingCartIndex = state.carts.findIndex((c) => c.id === updatedCart.id);

        const newCarts =
          existingCartIndex >= 0
            ? state.carts.map((c) => (c.id === updatedCart.id ? updatedCart : c))
            : [...state.carts, updatedCart];

        return {
          carts: newCarts,
          isLoading: false,
        };
      });

      // Calculate total items
      get().calculateTotalItems();

      return updatedCart;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al agregar item al carrito',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update cart item quantity
  updateItemQuantity: async (cartItemId, quantity) => {
    try {
      set({ isLoading: true, error: null });

      const updatedCart = await cartService.updateCartItem(cartItemId, {
        quantity,
      });

      // Update carts list
      set((state) => ({
        carts: state.carts.map((c) => (c.id === updatedCart.id ? updatedCart : c)),
        currentCart: state.currentCart?.id === updatedCart.id ? updatedCart : state.currentCart,
        isLoading: false,
      }));

      // Calculate total items
      get().calculateTotalItems();

      return updatedCart;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al actualizar item',
        isLoading: false,
      });
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (cartItemId) => {
    try {
      set({ isLoading: true, error: null });

      await cartService.removeCartItem(cartItemId);

      // Refresh carts
      await get().fetchCarts();

      set({ isLoading: false });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al eliminar item',
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear cart
  clearCart: async (cartId) => {
    try {
      set({ isLoading: true, error: null });

      await cartService.clearCart(cartId);

      // Remove cart from list
      set((state) => ({
        carts: state.carts.filter((c) => c.id !== cartId),
        currentCart: state.currentCart?.id === cartId ? null : state.currentCart,
        isLoading: false,
      }));

      // Calculate total items
      get().calculateTotalItems();
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al vaciar el carrito',
        isLoading: false,
      });
      throw error;
    }
  },

  // Checkout cart (direct)
  checkout: async (cartId) => {
    try {
      set({ isLoading: true, error: null });

      const purchase = await cartService.checkoutCart(cartId);

      // Remove cart from list after successful checkout
      set((state) => ({
        carts: state.carts.filter((c) => c.id !== cartId),
        currentCart: state.currentCart?.id === cartId ? null : state.currentCart,
        isLoading: false,
      }));

      // Calculate total items
      get().calculateTotalItems();

      return purchase;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al procesar la compra',
        isLoading: false,
      });
      throw error;
    }
  },

  // Checkout cart with Stripe
  checkoutStripe: async (cartId) => {
    try {
      set({ isLoading: true, error: null });

      const preference = await cartService.checkoutCartStripe(cartId);

      set({ isLoading: false });

      return preference;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al crear sesión de pago',
        isLoading: false,
      });
      throw error;
    }
  },

  // Set current cart
  setCurrentCart: (cart) => set({ currentCart: cart }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),

  // Calculate total items across all carts
  calculateTotalItems: () => {
    const { carts } = get();
    const totalItems = carts.reduce((total, cart) => {
      return total + cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    set({ totalItems });
  },
}));
