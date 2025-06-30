import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { AppGateway } from './app.gateway';
import { ActivityLoggerMiddleware } from './middleware/activity-log.middleware';
import { jwtConstants } from './module/authentication/jwt.secret';
import { JwtStrategy } from './module/authentication/jwt.strategy';

import { AuthenticationController } from './module/authentication/authentication.controller';
import { PelangganController } from './module/pelanggan/pelanggan.controller';
import { InvoiceController } from './module/invoice/invoice.controller';

import { AxiosService } from './helper/utility/axios.service';
import { UtilityService } from './helper/utility/utility.service';
import { InvoiceService } from './module/invoice/invoice.service';
import { PelangganService } from './module/pelanggan/pelanggan.service';
import { AuthenticationService } from './module/authentication/authentication.service';
import { PaymentService } from './module/payment/payment.service';
import { PaymentController } from './module/payment/payment.controller';
import { LaporanController } from './module/laporan/laporan.controller';
import { LaporanService } from './module/laporan/laporan.service';
import { DashboardController } from './module/dashboard/dashboard.controller';
import { DashboardService } from './module/dashboard/dashboard.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret
        }),
        HttpModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [
        AuthenticationController,
        PelangganController,
        InvoiceController,
        PaymentController,
        LaporanController,
        DashboardController,
    ],
    providers: [
        JwtStrategy,
        PrismaService,
        AxiosService,
        UtilityService,
        AppGateway,
        AuthenticationService,
        PelangganService,
        InvoiceService,
        PaymentService,
        LaporanService,
        DashboardService
    ],
})
export class AppModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ActivityLoggerMiddleware).forRoutes('*');
    }
}
