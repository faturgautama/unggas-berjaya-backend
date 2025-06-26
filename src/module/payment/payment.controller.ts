import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../authentication/jwt.guard';
import { PaymentModel } from './payment.model';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {

    constructor(
        private _paymentService: PaymentService,
    ) { }

    @Get()
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPayment })
    async getAll(@Query() query: PaymentModel.IPaymentQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getAll(query);
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

    @Get('retrieve/:id_payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async getById(@Param('id_payment') id_payment: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getById(id_payment);
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

    @Post()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async create(@Body() body: PaymentModel.CreatePayment, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.create(req, body);
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

    @Put()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async update(@Body() body: PaymentModel.UpdatePayment, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.update(req, body);
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

    @Put('delete/:id_payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async delete(@Param('id_payment') id_payment: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.delete(req, id_payment);
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
