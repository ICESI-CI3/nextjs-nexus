import { act } from '@testing-library/react';
import { useCartStore } from '@/src/stores/useCartStore';
import * as cartService from '@/src/services/cartService';
import type { Cart } from '@/src/lib/types';

// Mock del servicio de carrito completo
jest.mock('@/src/services/cartService', () => ({
  __esModule: true,
  getUserCarts: jest.fn(),
  getCartById: jest.fn(),
  addToCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
  clearCart: jest.fn(),
  checkoutCart: jest.fn(),
  checkoutCartStripe: jest.fn(),
}));

// ------- Helpers y Fixtures -------

// Interfaces parciales para facilitar la creación de fixtures sin 'as any' excesivo
interface MockTicketType {
  id: string;
  name: string;
  price: number;
}

interface MockCartItem {
  id: string;
  ticketType: MockTicketType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  addedAt?: string;
}

interface MockCart {
  id: string;
  items: MockCartItem[];
  userId?: string;
  eventId?: string;
  event?: { id: string; title: string; status: string };
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const makeCartItem = (id: string, price: number, quantity: number): MockCartItem => ({
  id,
  ticketType: {
    id: `tt-${id}`,
    name: `Ticket ${id}`,
    price: price,
  },
  quantity,
  unitPrice: price,
  subtotal: price * quantity,
  addedAt: new Date().toISOString(),
});

const makeCart = (id: string, items: MockCartItem[] = []): MockCart => ({
  id,
  items,
  userId: 'user-1',
  eventId: `evt-${id}`,
  event: { id: `evt-${id}`, title: `Event ${id}`, status: 'ACTIVE' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('useCartStore', () => {
  // Resetear el store antes de CADA test para asegurar aislamiento total
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useCartStore.getState().reset();
    });
  });

  describe('Initial State & Utils', () => {
    it('debería tener el estado inicial correcto', () => {
      const state = useCartStore.getState();
      expect(state.carts).toEqual([]);
      expect(state.currentCart).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.totalItems).toBe(0);
    });

    it('clearError debería limpiar el mensaje de error', () => {
      act(() => useCartStore.setState({ error: 'Test error' }));
      expect(useCartStore.getState().error).toBe('Test error');

      act(() => useCartStore.getState().clearError());
      expect(useCartStore.getState().error).toBeNull();
    });
  });

  describe('fetchCarts', () => {
    it('debería cargar carritos y calcular totalItems correctamente', async () => {
      const mockCarts = [
        makeCart('c1', [makeCartItem('i1', 10, 2)]), // 2 items
        makeCart('c2', [makeCartItem('i2', 20, 3)]), // 3 items
      ];
      (cartService.getUserCarts as jest.Mock).mockResolvedValue(mockCarts);

      await act(async () => {
        await useCartStore.getState().fetchCarts();
      });

      const state = useCartStore.getState();
      expect(state.carts).toEqual(mockCarts);
      expect(state.totalItems).toBe(5);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('debería manejar errores en fetchCarts', async () => {
      (cartService.getUserCarts as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(useCartStore.getState().fetchCarts()).rejects.toThrow();

      const state = useCartStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('fetchCartById', () => {
    it('debería cargar un carrito específico y establecerlo como currentCart', async () => {
      const mockCart = makeCart('c1', [makeCartItem('i1', 10, 1)]);
      (cartService.getCartById as jest.Mock).mockResolvedValue(mockCart);

      await act(async () => {
        await useCartStore.getState().fetchCartById('c1');
      });

      const state = useCartStore.getState();
      expect(state.currentCart).toEqual(mockCart);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('addItem', () => {
    it('debería añadir un item y actualizar el estado', async () => {
      // Simulamos que el backend devuelve el carrito actualizado con el nuevo item
      const updatedCart = makeCart('c1', [makeCartItem('i1', 50, 2)]);
      (cartService.addToCart as jest.Mock).mockResolvedValue(updatedCart);

      const inputItem = { eventId: 'evt-c1', ticketTypeId: 'tt-i1', quantity: 2 };

      await act(async () => {
        await useCartStore.getState().addItem(inputItem);
      });

      const state = useCartStore.getState();
      // Debe haber actualizado la lista de carritos y el currentCart si coincide
      expect(state.carts).toContainEqual(updatedCart);
      expect(state.totalItems).toBe(2);
    });
  });

  describe('updateItemQuantity', () => {
    it('debería actualizar la cantidad de un item', async () => {
      const initialCart = makeCart('c1', [makeCartItem('i1', 10, 1)]);
      // Configuramos estado inicial
      act(() =>
        useCartStore.setState({
          carts: [initialCart as Cart],
          currentCart: initialCart as Cart,
          totalItems: 1,
        })
      );

      const updatedCart = makeCart('c1', [makeCartItem('i1', 10, 5)]); // Cantidad actualizada a 5
      (cartService.updateCartItem as jest.Mock).mockResolvedValue(updatedCart);

      await act(async () => {
        await useCartStore.getState().updateItemQuantity('i1', 5);
      });

      const state = useCartStore.getState();
      expect(state.carts[0]).toEqual(updatedCart);
      expect(state.currentCart).toEqual(updatedCart); // Debe sincronizar currentCart también
      expect(state.totalItems).toBe(5);
    });
  });

  describe('removeItem', () => {
    it('debería eliminar un item y recargar los carritos', async () => {
      const initialCart = makeCart('c1', [makeCartItem('i1', 10, 1)]);
      act(() => useCartStore.setState({ carts: [initialCart as Cart], totalItems: 1 }));

      (cartService.removeCartItem as jest.Mock).mockResolvedValue(undefined);
      // Simulamos que al recargar, el carrito viene vacío
      (cartService.getUserCarts as jest.Mock).mockResolvedValue([makeCart('c1', [])]);

      await act(async () => {
        await useCartStore.getState().removeItem('i1');
      });

      expect(cartService.removeCartItem).toHaveBeenCalled();
      // Verificamos indirectamente que llamó a fetchCarts al chequear el totalItems
      expect(useCartStore.getState().totalItems).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('debería vaciar el carrito y eliminarlo de la lista local', async () => {
      const cartToClear = makeCart('c1', [makeCartItem('i1', 10, 1)]);
      const otherCart = makeCart('c2', [makeCartItem('i2', 20, 2)]);

      act(() =>
        useCartStore.setState({
          carts: [cartToClear as Cart, otherCart as Cart],
          currentCart: cartToClear as Cart,
          totalItems: 3,
        })
      );

      (cartService.clearCart as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await useCartStore.getState().clearCart('c1');
      });

      const state = useCartStore.getState();
      expect(cartService.clearCart).toHaveBeenCalledWith('c1');
      expect(state.carts).toHaveLength(1);
      expect(state.carts[0].id).toBe('c2');
      expect(state.currentCart).toBeNull(); // Se limpió porque era el actual
      expect(state.totalItems).toBe(2);
    });
  });

  describe('checkouts', () => {
    it('checkout debería procesar compra y remover carrito', async () => {
      const cart = makeCart('c1', [makeCartItem('i1', 10, 1)]);
      act(() => useCartStore.setState({ carts: [cart as Cart], totalItems: 1 }));

      const mockPurchase = { id: 'p1', status: 'COMPLETED' };
      (cartService.checkoutCart as jest.Mock).mockResolvedValue(mockPurchase);

      const result = await act(async () => {
        return await useCartStore.getState().checkout('c1');
      });

      expect(result).toEqual(mockPurchase);
      expect(useCartStore.getState().carts).toHaveLength(0);
      expect(useCartStore.getState().totalItems).toBe(0);
    });

    it('checkoutStripe debería devolver sesión de pago sin borrar carrito localmente (espera confirmación)', async () => {
      const cart = makeCart('c1');
      act(() => useCartStore.setState({ carts: [cart as Cart] }));

      const mockPref = { sessionId: 'cs_test_123', url: 'https://checkout.stripe.com' };
      (cartService.checkoutCartStripe as jest.Mock).mockResolvedValue(mockPref);

      const result = await act(async () => {
        return await useCartStore.getState().checkoutStripe('c1');
      });

      expect(result).toEqual(mockPref);
      expect(useCartStore.getState().carts).toHaveLength(1); // Sigue ahí hasta que Stripe confirme
    });
  });
});
