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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async get<T>(
    path: string,
    init?: RequestInit & { params?: Record<string, string | string[]> },
  ): Promise<T> {
    const url = this.buildUrl(path, init?.params);
    const token = localStorage.getItem('accessToken');

    const headers: HeadersInit = {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers,
      ...init,
    });
    return this.handle<T>(res);
  }

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(this.url(path), {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });
    return this.handle<T>(res);
  }

  async put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(this.url(path), {
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });
    return this.handle<T>(res);
  }

  async delete<T>(path: string, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const headers: HeadersInit = {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(this.url(path), {
      method: 'DELETE',
      headers,
      ...init,
    });
    return this.handle<T>(res);
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

  private async handle<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    // Para respostas sem conteúdo (204, etc), não tenta ler o body
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      if (!res.ok) {
        throw new HttpError(`HTTP ${res.status}`, res.status);
      }
      return {} as T;
    }

    // Tenta ler o body, mas lida com casos onde está vazio
    let data: any;
    try {
      if (isJson) {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } else {
        data = await res.text();
      }
    } catch (error) {
      // Se falhar ao parsear, retorna vazio para respostas OK
      if (res.ok) {
        return {} as T;
      }
      throw new HttpError('Failed to parse response', res.status);
    }

    if (!res.ok) {
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
