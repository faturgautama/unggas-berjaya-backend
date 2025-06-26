import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class DtoExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let messages: string[] = [];
        if (exception instanceof HttpException) {
            const res = exception.getResponse();

            if (typeof res === 'object' && res && (res as any).message) {
                const msg = (res as any).message;
                messages = Array.isArray(msg) ? msg : [msg];
            } else {
                messages = [exception.message];
            }
        } else if (exception instanceof Error) {
            messages = [exception.message];
        } else {
            messages = ['Internal server error'];
        }

        response.status(status).json({
            status: false,
            message: messages,
            data: null,
        });
    }
}
