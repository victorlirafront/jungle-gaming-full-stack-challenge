import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface RpcError {
  name?: string;
  message?: string;
  status?: number;
  statusCode?: number;
}

interface ExceptionWithResponse {
  response?: {
    message?: string;
    error?: string;
    statusCode?: number;
  };
  status?: number;
  message?: string;
  name?: string;
}

interface ExceptionWithError {
  error?: RpcError;
}

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  private hasResponse(exception: unknown): exception is ExceptionWithResponse {
    return typeof exception === 'object' && exception !== null && 'response' in exception;
  }

  private hasError(exception: unknown): exception is ExceptionWithError {
    return typeof exception === 'object' && exception !== null && 'error' in exception;
  }

  private hasStatus(exception: unknown): exception is { status: number } {
    return typeof exception === 'object' && exception !== null && 'status' in exception;
  }

  private hasMessage(exception: unknown): exception is { message: string } {
    return typeof exception === 'object' && exception !== null && 'message' in exception;
  }

  private hasName(exception: unknown): exception is { name: string } {
    return typeof exception === 'object' && exception !== null && 'name' in exception;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error('RPC Exception caught:', JSON.stringify(exception, null, 2));

    if (this.hasResponse(exception)) {
      const errorResponse = exception.response;
      const status = exception.status || errorResponse?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

      return response.status(status).json({
        statusCode: status,
        message: errorResponse?.message || (this.hasMessage(exception) ? exception.message : 'Internal server error'),
        error: errorResponse?.error || (this.hasName(exception) ? exception.name.replace('Exception', '') : 'Error'),
      });
    }

    if (this.hasError(exception)) {
      const error = exception.error;

      const statusMap: Record<string, number> = {
        ConflictException: HttpStatus.CONFLICT,
        NotFoundException: HttpStatus.NOT_FOUND,
        UnauthorizedException: HttpStatus.UNAUTHORIZED,
        ForbiddenException: HttpStatus.FORBIDDEN,
        BadRequestException: HttpStatus.BAD_REQUEST,
      };

      const status = (error?.name && statusMap[error.name]) || HttpStatus.INTERNAL_SERVER_ERROR;

      return response.status(status).json({
        statusCode: status,
        message: error?.message || 'Internal server error',
        error: error?.name?.replace('Exception', '') || 'Error',
      });
    }

    const status = this.hasStatus(exception) ? exception.status : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.hasMessage(exception) ? exception.message : 'Internal server error';

    return response.status(status).json({
      statusCode: status,
      message,
      error: this.hasName(exception) ? exception.name : 'Error',
    });
  }
}

