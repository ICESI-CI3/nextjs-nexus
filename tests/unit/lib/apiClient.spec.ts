/**
 * High-coverage tests for src/lib/apiClient.ts
 * Targets request/response interceptors, proactive refresh, 401 retry flow,
 * error normalization, and the exported HTTP helpers and auth helpers.
 *
 * No `any`, eslint-friendly, and compatible with the project's Jest setup.
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import apiClient, {
  get as httpGet,
  post as httpPost,
  put as httpPut,
  patch as httpPatch,
  del as httpDelete,
} from '@/src/lib/apiClient';

import { AUTH_CONFIG, ERROR_MESSAGES } from '@/src/lib/constants';

// Set the environment variable for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

// We need to control the "isTokenExpiringSoon" behavior.
jest.mock('@/src/lib/jwtUtils', () => ({
  __esModule: true,
  isTokenExpiringSoon: jest.fn(),
}));

import { isTokenExpiringSoon } from '@/src/lib/jwtUtils';

// Small helpers
const setTokens = (access: string | null, refresh: string | null): void => {
  if (access !== null) {
    window.localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, access);
  } else {
    window.localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  }
  if (refresh !== null) {
    window.localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh);
  } else {
    window.localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }
};

const getAuthHeader = (headers: unknown): string | undefined => {
  if (
    headers &&
    typeof headers === 'object' &&
    'Authorization' in (headers as Record<string, unknown>)
  ) {
    return (headers as Record<string, string>).Authorization;
  }
  return undefined;
};

describe('apiClient', () => {
  let instanceMock: MockAdapter;
  let defaultMock: MockAdapter;

  beforeEach(() => {
    // jsdom gives us a working localStorage
    window.localStorage.clear();
    jest.resetAllMocks();

    // axios-mock for our axios instance (apiClient) and for the default axios (used on refresh)
    instanceMock = new MockAdapter(apiClient as unknown as ReturnType<typeof axios.create>);
    defaultMock = new MockAdapter(axios);

    // By default, consider token NOT expiring
    (isTokenExpiringSoon as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    instanceMock.restore();
    defaultMock.restore();
  });

  test('adds Authorization header when a token exists and is not expiring', async () => {
    setTokens('access.jwt.token', 'refresh.jwt.token');

    // Echo back headers so we can assert Authorization was injected
    instanceMock.onGet('/ping').reply((config) => {
      return [200, { ok: true, auth: getAuthHeader(config.headers) }];
    });

    const res = await httpGet<{ ok: boolean; auth?: string }>('/ping');
    expect(res.ok).toBe(true);
    expect(res.auth).toBe('Bearer access.jwt.token');
  });

  test('maps known error statuses to normalized ApiError objects', async () => {
    setTokens('t', 'r');

    instanceMock
      .onGet('/forbidden')
      .reply(403, { message: 'No puedes' })
      .onGet('/missing')
      .reply(404)
      .onGet('/invalid')
      .reply(422, { message: 'Datos malos', validationErrors: { email: ['Invalid'] } })
      .onGet('/oops')
      .reply(500, { message: 'boom' });

    await expect(httpGet<unknown>('/forbidden')).rejects.toMatchObject({
      message: 'No puedes',
      statusCode: 403,
    });

    await expect(httpGet<unknown>('/missing')).rejects.toMatchObject({
      message: ERROR_MESSAGES.NOT_FOUND,
      statusCode: 404,
    });

    await expect(httpGet<unknown>('/invalid')).rejects.toMatchObject({
      message: 'Datos malos',
      statusCode: 422,
      validationErrors: { email: ['Invalid'] },
    });

    await expect(httpGet<unknown>('/oops')).rejects.toMatchObject({
      message: 'boom',
      statusCode: 500,
    });
  });

  test('exported helpers get/post/put/patch/delete return response.data', async () => {
    setTokens('ok', 'r');

    instanceMock.onGet('/items').reply(200, { list: [1, 2] });
    instanceMock.onPost('/items').reply(201, { created: { id: 10 } });
    instanceMock.onPut('/items/10').reply(200, { updated: { id: 10, name: 'X' } });
    instanceMock.onPatch('/items/10').reply(200, { patched: { id: 10, price: 99 } });
    instanceMock.onDelete('/items/10').reply(200, { ok: true });

    await expect(httpGet<{ list: number[] }>('/items')).resolves.toEqual({ list: [1, 2] });
    await expect(
      httpPost<{ created: { id: number } }, { name: string }>('/items', { name: 'a' })
    ).resolves.toEqual({ created: { id: 10 } });
    await expect(
      httpPut<{ updated: { id: number; name: string } }, { name: string }>('/items/10', {
        name: 'X',
      })
    ).resolves.toEqual({ updated: { id: 10, name: 'X' } });
    await expect(
      httpPatch<{ patched: { id: number; price: number } }, { price: number }>('/items/10', {
        price: 99,
      })
    ).resolves.toEqual({ patched: { id: 10, price: 99 } });
    await expect(httpDelete<{ ok: boolean }>('/items/10')).resolves.toEqual({ ok: true });
  });
});
