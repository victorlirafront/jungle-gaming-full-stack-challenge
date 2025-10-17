import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (error?.error) {
          const rpcError = error.error;
          const statusCode = this.getHttpStatus(rpcError.statusCode || rpcError.status);
          const message = rpcError.message || 'Internal server error';

          return throwError(() => new HttpException(message, statusCode));
        }

        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        return throwError(
          () => new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
        );
      })
    );
  }

  private getHttpStatus(statusCode: number): number {
    const statusMap: Record<number, number> = {
      400: HttpStatus.BAD_REQUEST,
      401: HttpStatus.UNAUTHORIZED,
      403: HttpStatus.FORBIDDEN,
      404: HttpStatus.NOT_FOUND,
      409: HttpStatus.CONFLICT,
      422: HttpStatus.UNPROCESSABLE_ENTITY,
      500: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[statusCode] || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

