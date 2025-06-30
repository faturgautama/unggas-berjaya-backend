import { Controller, Get, HttpStatus, Param, Query, Res, UseGuards } from '@nestjs/common';
import { LaporanService } from './laporan.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../authentication/jwt.guard';
import { LaporanModel } from './laporan.model';
import { Response } from 'express';

@Controller('laporan')
@ApiTags('Laporan')
export class LaporanController {
    constructor(private readonly laporanService: LaporanService) { }

    @Get('piutang-customer')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, type: LaporanModel.GetLaporanPiutangCustomer })
    async getLaporanPiutangCustomer(
        @Query() query: LaporanModel.QueryBulanTahun,
        @Res() res: Response
    ) {
        try {
            const data = await this.laporanService.getLaporanPiutangCustomer(query);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('umur-piutang-customer')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, type: LaporanModel.GetLaporanUmurPiutangCustomer })
    async getLaporanUmurPiutangCustomer(
        @Query() query: LaporanModel.QueryBulanTahun,
        @Res() res: Response
    ) {
        try {
            const data = await this.laporanService.getLaporanUmurPiutangCustomer(query);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('pembayaran-masuk')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    async getLaporanPembayaranMasuk(
        @Query() query: LaporanModel.QueryBulanTahun,
        @Res() res: Response
    ) {
        try {
            const data = await this.laporanService.getLaporanPembayaranMasuk(query);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('rekapitulasi-penjualan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    async getRekapitulasiPenjualan(
        @Query() query: LaporanModel.QueryBulanTahun,
        @Res() res: Response
    ) {
        try {
            const data = await this.laporanService.getRekapitulasiPenjualan(query);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('customer-piutang-terbanyak')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    async getCustomerPiutangTerbanyak(@Res() res: Response) {
        try {
            const data = await this.laporanService.getCustomerPiutangTerbanyak();
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('riwayat-pembayaran/:id_pelanggan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    async getRiwayatPembayaran(
        @Param('id_pelanggan') id_pelanggan: number,
        @Res() res: Response
    ) {
        try {
            const data = await this.laporanService.getRiwayatPembayaran(Number(id_pelanggan));
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }
}
