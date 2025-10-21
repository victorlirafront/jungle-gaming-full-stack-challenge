import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const mockJwtService = {
  verifyAsync: jest.fn(),
};

interface MockRequest {
  headers: Record<string, string>;
  user?: JwtPayload;
}

const createMockExecutionContext = (headers: Record<string, string> = {}): { context: ExecutionContext; request: MockRequest } => {
  const request: MockRequest = {
    headers,
    user: undefined,
  };
  
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;

  return { context, request };
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true and attach user to request when token is valid', async () => {
      const mockPayload: JwtPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
      };
      const { context, request } = createMockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(request.user).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const { context } = createMockExecutionContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('No token provided');
      
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const { context } = createMockExecutionContext({ 'content-type': 'application/json' });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('No token provided');
    });

    it('should throw UnauthorizedException when token type is not Bearer', async () => {
      const { context } = createMockExecutionContext({
        authorization: 'Basic invalid-token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('No token provided');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const { context } = createMockExecutionContext({
        authorization: 'Bearer invalid-token',
      });

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
      
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const { context } = createMockExecutionContext({
        authorization: 'Bearer expired-token',
      });

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    });

    it('should extract token correctly from Bearer authorization header', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const mockPayload: JwtPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
      };
      const { context } = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
    });
  });
});

