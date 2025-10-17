export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class HttpClient {
  private readonly baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private getHeaders(init?: RequestInit, withContentType = false): HeadersInit {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
      Accept: 'application/json',
      ...(withContentType && { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(
    path: string,
    init?: RequestInit & { params?: Record<string, string | string[]> },
  ): Promise<T> {
    const url = this.buildUrl(path, init?.params);
    const makeRequest = () => fetch(url, {
      method: 'GET',
      headers: this.getHeaders(init),
      ...init,
    });

    const res = await makeRequest();
    return this.handle<T>(res, makeRequest);
  }

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const makeRequest = () => fetch(this.url(path), {
      method: 'POST',
      headers: this.getHeaders(init, true),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });

    const res = await makeRequest();
    return this.handle<T>(res, makeRequest);
  }

  async put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const makeRequest = () => fetch(this.url(path), {
      method: 'PUT',
      headers: this.getHeaders(init, true),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });

    const res = await makeRequest();
    return this.handle<T>(res, makeRequest);
  }

  async delete<T>(path: string, init?: RequestInit): Promise<T> {
    const makeRequest = () => fetch(this.url(path), {
      method: 'DELETE',
      headers: this.getHeaders(init),
      ...init,
    });

    const res = await makeRequest();
    return this.handle<T>(res, makeRequest);
  }

  private url(path: string): string {
    return path.startsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
  }

  private buildUrl(path: string, params?: Record<string, string | string[]>): string {
    const url = this.url(path);
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new HttpError('No refresh token available', 401);
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new HttpError('Refresh token expired', 401);
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken;

    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return newAccessToken;
  }

  private async handleTokenRefresh<T>(
    originalRequest: () => Promise<Response>
  ): Promise<T> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      try {
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;
        this.onRefreshed(newToken);

        const retryResponse = await originalRequest();
        return this.handle<T>(retryResponse);
      } catch (error) {
        this.isRefreshing = false;
        this.refreshSubscribers = [];
        throw error;
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        this.addRefreshSubscriber(async () => {
          try {
            const retryResponse = await originalRequest();
            resolve(this.handle<T>(retryResponse));
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }

  private async handle<T>(res: Response, originalRequest?: () => Promise<Response>): Promise<T> {
    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      if (!res.ok) {
        throw new HttpError(`HTTP ${res.status}`, res.status);
      }
      return {} as T;
    }

    let data: any;
    try {
      if (isJson) {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } else {
        data = await res.text();
      }
    } catch (error) {
      if (res.ok) {
        return {} as T;
      }
      throw new HttpError('Failed to parse response', res.status);
    }

    if (!res.ok) {
      if (res.status === 401 && originalRequest && !res.url.includes('/auth/refresh')) {
        return this.handleTokenRefresh<T>(originalRequest);
      }

      const message =
        isJson && typeof data === 'object' && data && 'message' in data
          ? String((data as Record<string, unknown>).message)
          : `HTTP ${res.status}`;
      throw new HttpError(message, res.status, data);
    }

    return data as T;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const httpClient = new HttpClient(API_URL);
