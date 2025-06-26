import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as useragent from 'useragent';

@Injectable()
export class ActivityLoggerMiddleware implements NestMiddleware {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const endpoint = req.params['0'] || req.originalUrl || '';

        // Skip if these paths
        const excludedPaths = ['authentication', 'create-payment', 'callback'];
        if (excludedPaths.some(p => endpoint.includes(p))) return next();

        // Only log certain GETs
        const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
        const isSpecialGet = req.method === 'GET' && (
            endpoint.includes('retrigger') || endpoint.includes('send-message')
        );
        const isSync = req.method === 'POST' && endpoint.includes('sync');

        if ((isWriteMethod || isSpecialGet) && !isSync) {
            const ipAddress = req.ip; // ✅ Trust proxy already set
            const agent = useragent.parse(req.headers['user-agent'] || '');
            let id_user: number | null = null;

            const authHeader = req.headers['authorization'];
            if (authHeader?.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded: any = this.jwtService.verify(token);
                    id_user = decoded?.id_user ?? null;
                } catch (err) {
                    console.warn('Invalid JWT token:', err.message);
                }
            }

            const payload = {
                id_user,
                endpoint,
                method: req.method,
                request_body: isWriteMethod ? req.body : {},
                ip_address: ipAddress,
                browser: agent.toString(),
            };

            await this.prisma.log_activity_user.create({ data: payload });
        }

        return next();
    }
}
