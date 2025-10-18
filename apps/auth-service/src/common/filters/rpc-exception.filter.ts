import { Catch, RpcExceptionFilter as NestRpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter implements NestRpcExceptionFilter<RpcException> {
  catch(exception: unknown, _host: ArgumentsHost): Observable<unknown> {
    // If it's already an RpcException, just throw it
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    const errorObj = exception as {
      status?: number;
      message?: string;
      name?: string;
    };

    // For HTTP exceptions, preserve the status and message
    if (errorObj.status && errorObj.message) {
      return throwError(() => ({
        response: {
          message: errorObj.message,
          error: errorObj.name?.replace('Exception', '') || 'Error',
          statusCode: errorObj.status,
        },
        status: errorObj.status,
        message: errorObj.message,
        name: errorObj.name,
      }));
    }

    // For other exceptions
    return throwError(() => ({
      response: {
        message: errorObj.message || 'Internal server error',
        error: 'Internal Server Error',
        statusCode: 500,
      },
      status: 500,
      message: errorObj.message || 'Internal server error',
      name: 'InternalServerError',
    }));
  }
}

