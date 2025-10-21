const SENSITIVE_KEYS = ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'token', 'accessToken', 'refreshToken'];

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private shouldLog(): boolean {
    return this.isDevelopment;
  }

  private sanitize(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  log(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      const sanitizedArgs = args.map(arg => this.sanitize(arg));
      console.log(`[LOG] ${message}`, ...sanitizedArgs);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      const sanitizedArgs = args.map(arg => this.sanitize(arg));
      console.warn(`[WARN] ${message}`, ...sanitizedArgs);
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog()) {
      const sanitizedError = this.sanitize(error);
      console.error(`[ERROR] ${message}`, sanitizedError);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      const sanitizedArgs = args.map(arg => this.sanitize(arg));
      console.info(`[INFO] ${message}`, ...sanitizedArgs);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      const sanitizedArgs = args.map(arg => this.sanitize(arg));
      console.debug(`[DEBUG] ${message}`, ...sanitizedArgs);
    }
  }
}

export const logger = new Logger();

