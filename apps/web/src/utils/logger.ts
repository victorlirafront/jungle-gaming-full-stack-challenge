class Logger {
  private isDevelopment = import.meta.env.DEV;

  private shouldLog(): boolean {
    return this.isDevelopment;
  }

  log(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog()) {
      console.error(`[ERROR] ${message}`, error);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();

