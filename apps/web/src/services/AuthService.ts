import { httpClient } from '@/http';
import { mapAuthResponse } from '@/mappers';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
} from '@/types/auth.types';

export class AuthService {
  private readonly endpoint = '/auth';

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      `${this.endpoint}/register`,
      data
    );
    return mapAuthResponse(response);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      `${this.endpoint}/login`,
      data
    );
    return mapAuthResponse(response);
  }

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      `${this.endpoint}/refresh`,
      data
    );
    return mapAuthResponse(response);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export const authService = new AuthService();

