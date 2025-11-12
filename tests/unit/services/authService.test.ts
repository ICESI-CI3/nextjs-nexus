import authService, { LoginSuccess, LoginNeeds2FA } from '@/src/services/authService';
import apiClient from '@/src/lib/apiClient';
import { AUTH_CONFIG } from '@/src/lib/constants';

// --- MOCKS ---
const mockSetAuthToken = jest.fn();
const mockRemoveAuthToken = jest.fn();
const mockGetLocalStorage = jest.fn();
const mockSetLocalStorage = jest.fn();
const mockRemoveLocalStorage = jest.fn();

jest.mock('@/src/lib/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  setAuthToken: (...args: unknown[]) => mockSetAuthToken(...args),
  removeAuthToken: (...args: unknown[]) => mockRemoveAuthToken(...args),
}));

jest.mock('@/src/lib/utils', () => ({
  getLocalStorage: (...args: unknown[]) => mockGetLocalStorage(...args),
  setLocalStorage: (...args: unknown[]) => mockSetLocalStorage(...args),
  removeLocalStorage: (...args: unknown[]) => mockRemoveLocalStorage(...args),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe retornar tokens y persistirlos cuando el login es exitoso', async () => {
      const mockResponse = { access_token: 'at1', refresh_token: 'rt1' };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = (await authService.login('test@test.com', '123')) as LoginSuccess;

      expect(result.requires2FA).toBe(false);
      expect(result.accessToken).toBe('at1');
      expect(mockSetAuthToken).toHaveBeenCalledWith('at1');
      expect(mockSetLocalStorage).toHaveBeenCalledWith(AUTH_CONFIG.TOKEN_KEY, 'at1');
      expect(mockSetLocalStorage).toHaveBeenCalledWith(AUTH_CONFIG.REFRESH_TOKEN_KEY, 'rt1');
    });

    it('debe retornar requires2FA si el backend lo indica', async () => {
      const mockResponse = { requires2FA: true, message: 'OTP sent' };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = (await authService.login('test@test.com', '123')) as LoginNeeds2FA;

      expect(result.requires2FA).toBe(true);
      expect(result.message).toBe('OTP sent');
      // No debe persistir tokens aún
      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('usa el refreshToken del argumento si se provee', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { access_token: 'new_at', refresh_token: 'new_rt' },
      });

      await authService.refresh('arg_rt');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refresh_token: 'arg_rt' });
    });

    it('usa el refreshToken de localStorage si NO se provee argumento', async () => {
      mockGetLocalStorage.mockReturnValue('stored_rt');
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { access_token: 'new_at', refresh_token: 'new_rt' },
      });

      await authService.refresh();

      expect(mockGetLocalStorage).toHaveBeenCalledWith(AUTH_CONFIG.REFRESH_TOKEN_KEY, null);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refresh_token: 'stored_rt' });
    });

    it('limpia la sesión (logout local) si el refresh falla', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Refresh expired'));

      await expect(authService.refresh('bad_rt')).rejects.toThrow('Refresh expired');

      expect(mockRemoveAuthToken).toHaveBeenCalled();
      expect(mockRemoveLocalStorage).toHaveBeenCalledWith(AUTH_CONFIG.TOKEN_KEY);
      expect(mockRemoveLocalStorage).toHaveBeenCalledWith(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    });
  });

  describe('logout', () => {
    it('llama al endpoint y limpia datos locales en éxito', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});
      await authService.logout();
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockRemoveAuthToken).toHaveBeenCalled();
      expect(mockRemoveLocalStorage).toHaveBeenCalledWith(AUTH_CONFIG.USER_KEY);
    });

    it('limpia datos locales INCLUSO si el endpoint falla (finally block)', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));
      await authService.logout(); // No debería lanzar error
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockRemoveAuthToken).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('transforma la respuesta del backend al tipo User correctamente', async () => {
      const mockApiProfile = {
        id: 'u1',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        twoFactorEnabled: true,
        roles: [{ id: 'r1', name: 'ADMIN', permissions: [{ id: 'p1', name: 'READ' }] }],
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockApiProfile });

      const user = await authService.getProfile();

      expect(user.id).toBe('u1');
      expect(user.roleIds).toEqual(['r1']);
      expect(user.roles![0].permissionIds).toEqual(['p1']);
      expect(user.createdAt).toBeDefined();
    });
  });

  describe('register', () => {
    const regData = {
      firstName: 'F',
      lastName: 'L',
      email: 'e@mail.com',
      password: 'p',
      roleIds: ['USER'],
    };

    it('maneja registro exitoso con retorno de tokens', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { access_token: 'at', refresh_token: 'rt' },
      });

      const res = await authService.register(regData);
      expect((res as LoginSuccess).accessToken).toBe('at');
      expect(mockSetAuthToken).toHaveBeenCalledWith('at');
    });

    it('maneja registro que requiere verificación 2FA inmediata', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { requires2FA: true },
      });

      const res = await authService.register(regData);
      expect(res.requires2FA).toBe(true);
      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('normalizeError (cobertura interna)', () => {
    // Como normalizeError no está exportada, la probamos a través de cualquier método público que la use.
    it('maneja Error estándar', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Mensaje estándar'));
      await expect(authService.login('a', 'b')).rejects.toThrow('Mensaje estándar');
    });

    it('maneja error tipo Axios con response.data string', async () => {
      const axiosErr = { response: { data: 'Error desde backend en string' } };
      (apiClient.post as jest.Mock).mockRejectedValue(axiosErr);
      await expect(authService.login('a', 'b')).rejects.toThrow('Error desde backend en string');
    });

    it('maneja error tipo Axios con response.data.message', async () => {
      const axiosErr = { response: { data: { message: 'Mensaje anidado' } } };
      (apiClient.post as jest.Mock).mockRejectedValue(axiosErr);
      await expect(authService.login('a', 'b')).rejects.toThrow('Mensaje anidado');
    });

    it('maneja objeto con propiedad message', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({ message: 'Error custom object' });
      await expect(authService.login('a', 'b')).rejects.toThrow('Error custom object');
    });

    it('maneja error desconocido completamente (fallback a JSON o Unexpected)', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({ someWeirdField: 123 });
      // Esperamos que lo convierta a JSON o use el fallback
      try {
        await authService.login('a', 'b');
      } catch (e: unknown) {
        const error = e as Error;
        expect(error.message).toMatch(/{"someWeirdField":123}|Unexpected error/);
      }
    });
  });

  // Tests rápidos para completar cobertura de funciones passthrough
  describe('Funciones passthrough de 2FA y users', () => {
    it('loginWith2FA persiste tokens', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { access_token: 'a', refresh_token: 'b' },
      });
      await authService.loginWith2FA('e', 'p', 'code');
      expect(mockSetAuthToken).toHaveBeenCalledWith('a');
    });

    it('verify2FA persiste tokens', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { access_token: 'a', refresh_token: 'b' },
      });
      await authService.verify2FA('code');
      expect(mockSetAuthToken).toHaveBeenCalledWith('a');
    });

    it('setup2FA devuelve data', async () => {
      const mockData = { secret: 's', qrCodeUrl: 'q', backupCodes: [] };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });
      expect(await authService.setup2FA()).toEqual(mockData);
    });

    it('enable2FA llama al post correcto', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});
      await authService.enable2FA('code');
      expect(apiClient.post).toHaveBeenCalledWith('/auth/enable-2fa', { totpCode: 'code' });
    });

    it('disable2FA llama al post correcto', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});
      await authService.disable2FA('code');
      expect(apiClient.post).toHaveBeenCalledWith('/auth/disable-2fa', { code: 'code' });
    });

    it('createUser llama al post correcto (admin)', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});
      const userData = { firstName: 'A', lastName: 'B', email: 'C', password: 'D', roleIds: [] };
      await authService.createUser(userData);
      expect(apiClient.post).toHaveBeenCalledWith('/users', userData);
    });
  });
});
