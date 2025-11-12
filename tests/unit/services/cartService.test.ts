jest.mock('../../../src/lib/apiClient');

import {
  getUserCarts,
  getCartById,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkoutCart,
  checkoutCartStripe,
} from '@/src/services/cartService';
import * as apiClient from '../../../src/lib/apiClient';

describe('cartService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCarts', () => {
    it('should fetch user carts successfully', async () => {
      const mockCarts = [{ id: '1', items: [] }];
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockCarts);

      const result = await getUserCarts();

      expect(apiClient.get).toHaveBeenCalledWith('/carts');
      expect(result).toEqual(mockCarts);
    });

    it('should handle errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Error'));
      await expect(getUserCarts()).rejects.toThrow('Error');
    });
  });

  describe('getCartById', () => {
    it('should fetch cart by ID', async () => {
      const mockCart = { id: '123', items: [] };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockCart);

      const result = await getCartById('123');

      expect(apiClient.get).toHaveBeenCalledWith('/carts/123');
      expect(result).toEqual(mockCart);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const data = { eventId: '1', ticketTypeId: '1', quantity: 2 };
      const mockCart = { id: '1', items: [data] };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockCart);

      const result = await addToCart(data);

      expect(apiClient.post).toHaveBeenCalledWith('/carts/items', data);
      expect(result).toEqual(mockCart);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const data = { quantity: 5 };
      const mockCart = { id: '1', items: [] };
      (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockCart);

      const result = await updateCartItem('item-123', data);

      expect(apiClient.patch).toHaveBeenCalledWith('/carts/items/item-123', data);
      expect(result).toEqual(mockCart);
    });
  });

  describe('removeCartItem', () => {
    it('should remove item from cart', async () => {
      (apiClient.del as jest.Mock).mockResolvedValueOnce(undefined);

      await removeCartItem('item-123');

      expect(apiClient.del).toHaveBeenCalledWith('/carts/items/item-123');
    });
  });

  describe('clearCart', () => {
    it('should clear cart', async () => {
      (apiClient.del as jest.Mock).mockResolvedValueOnce(undefined);

      await clearCart('cart-123');

      expect(apiClient.del).toHaveBeenCalledWith('/carts/cart-123');
    });
  });

  describe('checkoutCart', () => {
    it('should checkout cart', async () => {
      const mockPurchase = { id: 'purchase-1' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockPurchase);

      const result = await checkoutCart('cart-123');

      expect(apiClient.post).toHaveBeenCalledWith('/carts/cart-123/checkout');
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('checkoutCartStripe', () => {
    it('should create Stripe checkout session', async () => {
      const mockPreference = { sessionId: 'cs_test_123', url: 'https://checkout.stripe.com' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockPreference);

      const result = await checkoutCartStripe('cart-123');

      expect(apiClient.post).toHaveBeenCalledWith('/carts/cart-123/checkout/stripe');
      expect(result).toEqual(mockPreference);
    });
  });
});
