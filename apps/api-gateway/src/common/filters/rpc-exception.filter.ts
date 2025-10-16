import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { throwError } from 'rxjs';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log the error with full details
    this.logger.error('RPC Exception caught:', JSON.stringify(exception, null, 2));

    // Handle exceptions with response property (from microservices)
    if (exception?.response) {
      const { response: errorResponse } = exception;
      const status = exception.status || errorResponse.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

      return response.status(status).json({
        statusCode: status,
        message: errorResponse.message || exception.message || 'Internal server error',
        error: errorResponse.error || exception.name?.replace('Exception', '') || 'Error',
      });
    }

    // Handle RPC errors from microservices (legacy format)
    if (exception?.error) {
      const error = exception.error;

      // Map exception names to HTTP status codes
      const statusMap: Record<string, number> = {
        ConflictException: HttpStatus.CONFLICT,
        NotFoundException: HttpStatus.NOT_FOUND,
        UnauthorizedException: HttpStatus.UNAUTHORIZED,
        ForbiddenException: HttpStatus.FORBIDDEN,
        BadRequestException: HttpStatus.BAD_REQUEST,
      };

      const status = statusMap[error.name] || HttpStatus.INTERNAL_SERVER_ERROR;

      return response.status(status).json({
        statusCode: status,
        message: error.message || 'Internal server error',
        error: error.name?.replace('Exception', '') || 'Error',
      });
    }

    // Handle standard HTTP exceptions
    const status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception?.message || 'Internal server error';

    return response.status(status).json({
      statusCode: status,
      message,
      error: exception?.name || 'Error',
    });
  }
}

