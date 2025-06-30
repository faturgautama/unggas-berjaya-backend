import { Controller, Get, HttpStatus, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardModel } from './dashboard.model';
import { JwtGuard } from 'src/module/authentication/jwt.guard';
import { Request, Response } from 'express';

@Controller('dashboard')
@ApiTags('Dashboard')
export class DashboardController {

    constructor(
        private _dashboardService: DashboardService,
    ) { }

    @Get('count')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: DashboardModel.GetDashboardCount })
    async getCount(@Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._dashboardService.getDashboardCount(req);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('payment-weekly/:start_date/:end_date')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: DashboardModel.GetDashboardPaymentWeekly })
    async getPaymentWeekly(@Param('start_date') start_date: string, @Param('end_date') end_date: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._dashboardService.getDashboardPaymentWeekly(req, start_date, end_date);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('payment-monhtly/:date')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: DashboardModel.GetDashboardPaymentWeekly })
    async getPaymentMontly(@Param('date') date: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._dashboardService.getDashboardPaymentMonthly(req, date);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('payment-yearly/:year')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: DashboardModel.GetDashboardPaymentWeekly })
    async getPaymentYearly(@Param('year') year: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._dashboardService.getDashboardPaymentYearly(req, year);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('latest-payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: DashboardModel.GetDashboardPaymentWeekly })
    async getLatestPayment(@Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._dashboardService.getLatestPayment(req);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }
}
