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

  async getAllUsers(): Promise<Array<{ id: string; username: string; email: string }>> {
    return httpClient.get<Array<{ id: string; username: string; email: string }>>(
      `${this.endpoint}/users`
    );
  }

  async getProfile(): Promise<{ id: string; email: string; username: string; fullName?: string }> {
    return httpClient.get<{ id: string; email: string; username: string; fullName?: string }>(
      `${this.endpoint}/profile`
    );
  }

  async updateProfile(data: { username?: string; fullName?: string }): Promise<{ id: string; email: string; username: string; fullName?: string }> {
    return httpClient.put<{ id: string; email: string; username: string; fullName?: string }>(
      `${this.endpoint}/profile`,
      data
    );
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(
      `${this.endpoint}/change-password`,
      { currentPassword, newPassword }
    );
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

