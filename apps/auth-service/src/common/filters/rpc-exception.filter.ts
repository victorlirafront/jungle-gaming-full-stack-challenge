import { Catch, RpcExceptionFilter as NestRpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter implements NestRpcExceptionFilter<RpcException> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    // If it's already an RpcException, just throw it
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    // For HTTP exceptions, preserve the status and message
    if (exception.status && exception.message) {
      return throwError(() => ({
        response: {
          message: exception.message,
          error: exception.name?.replace('Exception', '') || 'Error',
          statusCode: exception.status,
        },
        status: exception.status,
        message: exception.message,
        name: exception.name,
      }));
    }

    // For other exceptions
    return throwError(() => ({
      response: {
        message: exception.message || 'Internal server error',
        error: 'Internal Server Error',
        statusCode: 500,
      },
      status: 500,
      message: exception.message || 'Internal server error',
      name: 'InternalServerError',
    }));
  }
}

