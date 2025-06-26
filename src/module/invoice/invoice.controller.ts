import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/module/authentication/jwt.guard';
import { InvoiceModel } from './invoice.model';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
@ApiTags('Invoice')
export class InvoiceController {

    constructor(
        private _invoiceService: InvoiceService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetAllInvoice })
    async getAll(@Query() query: InvoiceModel.IInvoiceQueryParams, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._invoiceService.getAll(req, query);
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

    @Get('retrieve/:id_invoice')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetByIdInvoice })
    async getById(@Param('id_invoice') id_invoice: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._invoiceService.getById(id_invoice);
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

    @Post('sync')
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetByIdInvoice })
    async sync(@Body() payload: InvoiceModel.SyncInvoice, @Res() res: Response) {
        try {
            const data = await this._invoiceService.syncInvoice(payload);
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

    @Get('numbers')
    async getInvoiceNumbers() {
        return this._invoiceService.getInvoiceNumbers();
    }
}
