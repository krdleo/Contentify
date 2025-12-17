import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const API_BASE_URL = 'http://localhost:4000/api/v1';
const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;

const readAuthorization = (headers: any) => {
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get('Authorization') ?? headers.get('authorization');
  return headers.Authorization ?? headers.authorization;
};

const createHrefSetterSpy = () => {
  try {
    return vi.spyOn(window.location, 'href', 'set');
  } catch {
    let hrefValue = 'http://localhost/';
    const mockLocation = {} as Location & { href: string };

    Object.defineProperty(mockLocation, 'href', {
      configurable: true,
      get: () => hrefValue,
      set: (value: string) => {
        hrefValue = value;
      },
    });

    try {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: mockLocation,
      });
    } catch {
      // If redefining window.location fails, at least provide a spy target for expectations.
    }

    return vi.spyOn(mockLocation, 'href', 'set');
  }
};

describe('src/api/axios.ts (interceptors)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires only one refresh for concurrent 401s and resumes queued requests with new token', async () => {
    const { api, setAccessToken, getAccessToken } = await import('./axios');

    const apiMock = new MockAdapter(api);
    const axiosMock = new MockAdapter(axios, { delayResponse: 50 });

    setAccessToken('expired_token');

    axiosMock.onPost(REFRESH_URL).reply(200, { success: true, data: { accessToken: 'new_token' } });

    const seenAuthorization: Array<string | undefined> = [];
    apiMock.onGet('/protected').reply((config) => {
      const authorization = readAuthorization(config.headers);
      seenAuthorization.push(authorization);
      if (authorization === 'Bearer new_token') {
        return [200, { ok: true }];
      }
      return [401, { success: false }];
    });

    const requests = Array.from({ length: 5 }, () => api.get('/protected'));

    const responses = await Promise.all(requests);

    expect(axiosMock.history.post).toHaveLength(1);
    expect(getAccessToken()).toBe('new_token');

    expect(responses).toHaveLength(5);
    responses.forEach((res) => expect(res.data).toEqual({ ok: true }));

    expect(apiMock.history.get).toHaveLength(10);
    expect(seenAuthorization).toHaveLength(10);
    expect(seenAuthorization.filter((h) => h === 'Bearer expired_token')).toHaveLength(5);
    expect(seenAuthorization.filter((h) => h === 'Bearer new_token')).toHaveLength(5);
  });

  it('redirects to /login when refresh fails', async () => {
    const hrefSetter = createHrefSetterSpy();

    const { api, setAccessToken } = await import('./axios');

    const apiMock = new MockAdapter(api);
    const axiosMock = new MockAdapter(axios);

    setAccessToken('expired_token');

    apiMock.onGet('/protected').reply(401, { success: false });
    axiosMock.onPost(REFRESH_URL).reply(401, { success: false });

    await expect(api.get('/protected')).rejects.toBeDefined();

    expect(hrefSetter).toHaveBeenCalledWith('/login');
  });
});
