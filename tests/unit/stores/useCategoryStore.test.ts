import { act } from '@testing-library/react';
import { useCategoryStore } from '@/src/stores/useCategoryStore';
import categoryService from '@/src/services/categoryService';
import {
  EventCategory,
  CreateEventCategoryDTO,
  UpdateEventCategoryDTO,
  ApiError,
} from '@/src/lib/types';

// Mock del servicio
jest.mock('@/src/services/categoryService');
const mockedCategoryService = categoryService as jest.Mocked<typeof categoryService>;

describe('useCategoryStore', () => {
  // Datos de prueba
  const mockCategory1: EventCategory = {
    id: '1',
    name: 'Música',
    description: 'Conciertos y festivales',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockCategory2: EventCategory = {
    id: '2',
    name: 'Teatro',
    description: 'Obras de teatro',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  };

  const mockApiError: ApiError = {
    message: 'Error simulado de API',
    statusCode: 500,
  };

  // Reset del store antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useCategoryStore.setState({
        categories: [],
        isLoading: false,
        error: null,
      });
    });
  });

  it('debería tener el estado inicial correcto', () => {
    const state = useCategoryStore.getState();
    expect(state.categories).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchCategories', () => {
    it('debería obtener las categorías y actualizar el estado (éxito)', async () => {
      // Arrange
      mockedCategoryService.getCategories.mockResolvedValue([mockCategory1, mockCategory2]);

      // Act
      await act(async () => {
        await useCategoryStore.getState().fetchCategories();
      });

      // Assert
      const state = useCategoryStore.getState();
      expect(state.categories).toEqual([mockCategory1, mockCategory2]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockedCategoryService.getCategories).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al obtener categorías', async () => {
      // Arrange
      mockedCategoryService.getCategories.mockRejectedValue(mockApiError);

      // Act & Assert
      await expect(useCategoryStore.getState().fetchCategories()).rejects.toEqual(mockApiError);

      const state = useCategoryStore.getState();
      expect(state.categories).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockApiError.message);
    });
  });

  describe('createCategory', () => {
    it('debería crear una categoría y añadirla al estado', async () => {
      // Arrange
      const newCategoryData: CreateEventCategoryDTO = { name: 'Nueva', description: 'Desc' };
      mockedCategoryService.createCategory.mockResolvedValue(mockCategory1);

      // Act
      await act(async () => {
        await useCategoryStore.getState().createCategory(newCategoryData);
      });

      // Assert
      const state = useCategoryStore.getState();
      expect(state.categories).toContainEqual(mockCategory1);
      expect(mockedCategoryService.createCategory).toHaveBeenCalledWith(newCategoryData);
    });

    it('debería manejar errores al crear categoría', async () => {
      // Arrange
      mockedCategoryService.createCategory.mockRejectedValue(mockApiError);

      // Act & Assert
      await expect(
        useCategoryStore.getState().createCategory({ name: 'Fail', description: '' })
      ).rejects.toEqual(mockApiError);

      expect(useCategoryStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('updateCategory', () => {
    it('debería actualizar una categoría existente en el estado', async () => {
      // Arrange - Preparamos el store con una categoría inicial
      useCategoryStore.setState({ categories: [mockCategory1] });

      const updateData: UpdateEventCategoryDTO = { name: 'Música Actualizada' };
      const updatedCategory = { ...mockCategory1, ...updateData };
      mockedCategoryService.updateCategory.mockResolvedValue(updatedCategory);

      // Act
      await act(async () => {
        await useCategoryStore.getState().updateCategory(mockCategory1.id, updateData);
      });

      // Assert
      const state = useCategoryStore.getState();
      expect(state.categories).toHaveLength(1);
      expect(state.categories[0]).toEqual(updatedCategory);
      expect(mockedCategoryService.updateCategory).toHaveBeenCalledWith(
        mockCategory1.id,
        updateData
      );
    });

    it('debería manejar errores al actualizar categoría', async () => {
      // Arrange
      mockedCategoryService.updateCategory.mockRejectedValue(mockApiError);

      // Act & Assert
      await expect(useCategoryStore.getState().updateCategory('1', {})).rejects.toEqual(
        mockApiError
      );

      expect(useCategoryStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('deleteCategory', () => {
    it('debería eliminar una categoría del estado', async () => {
      // Arrange - Preparamos el store con dos categorías
      useCategoryStore.setState({ categories: [mockCategory1, mockCategory2] });
      mockedCategoryService.deleteCategory.mockResolvedValue(undefined);

      // Act
      await act(async () => {
        await useCategoryStore.getState().deleteCategory(mockCategory1.id);
      });

      // Assert
      const state = useCategoryStore.getState();
      expect(state.categories).toHaveLength(1);
      expect(state.categories).toEqual([mockCategory2]); // Solo queda la categoría 2
      expect(mockedCategoryService.deleteCategory).toHaveBeenCalledWith(mockCategory1.id);
    });

    it('debería manejar errores al eliminar categoría', async () => {
      // Arrange
      mockedCategoryService.deleteCategory.mockRejectedValue(mockApiError);

      // Act & Assert
      await expect(useCategoryStore.getState().deleteCategory('1')).rejects.toEqual(mockApiError);

      expect(useCategoryStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('clearError', () => {
    it('debería limpiar el error del estado', () => {
      // Arrange
      useCategoryStore.setState({ error: 'Error persistente' });

      // Act
      act(() => {
        useCategoryStore.getState().clearError();
      });

      // Assert
      expect(useCategoryStore.getState().error).toBeNull();
    });
  });
});
