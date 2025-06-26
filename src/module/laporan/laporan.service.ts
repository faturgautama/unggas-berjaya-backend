import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LaporanModel } from './laporan.model';

@Injectable()
export class LaporanService {
    constructor(private readonly prisma: PrismaService) { }

    async getLaporanPiutangCustomer(query: { month?: number; year?: number; id_pelanggan?: number }) {
        try {
            const now = new Date();

            const whereInvoice: any = {
                is_deleted: false,
                is_lunas: false,
                pelanggan: { is_delete: false },
            };

            if (query.id_pelanggan) {
                whereInvoice.id_pelanggan = Number(query.id_pelanggan);
            }

            if (query.month !== undefined && query.year !== undefined) {
                const start = new Date(query.year, query.month - 1, 1);
                const end = new Date(query.year, query.month, 1);
                whereInvoice.invoice_date = { gte: start, lt: end };
            }

            const invoices = await this.prisma.invoice.findMany({
                where: whereInvoice,
                include: {
                    pelanggan: {
                        select: {
                            id_pelanggan: true,
                            full_name: true,
                            alamat: true,
                        },
                    },
                },
                orderBy: { invoice_date: 'asc' },
            });

            const results = invoices.map((inv) => {
                const invoiceAge = Math.floor(
                    (now.getTime() - new Date(inv.invoice_date).getTime()) / (1000 * 60 * 60 * 24)
                );

                const item: LaporanModel.LaporanPiutangCustomer = {
                    id_pelanggan: inv.pelanggan.id_pelanggan,
                    full_name: inv.pelanggan.full_name,
                    alamat: inv.pelanggan.alamat || '-',
                    invoice_number: inv.invoice_number,
                    invoice_date: inv.invoice_date,
                    total_tagihan_max_30_day: 0,
                    total_tagihan_max_60_day: 0,
                    total_tagihan_max_90_day: 0,
                    total_tagihan_more_90_day: 0,
                };

                if (invoiceAge <= 30) {
                    item.total_tagihan_max_30_day = inv.total;
                } else if (invoiceAge <= 60) {
                    item.total_tagihan_max_60_day = inv.total;
                } else if (invoiceAge <= 90) {
                    item.total_tagihan_max_90_day = inv.total;
                } else {
                    item.total_tagihan_more_90_day = inv.total;
                }

                return item;
            });

            return {
                status: true,
                message: '',
                data: results,
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status
            );
        }
    }

    async getLaporanPembayaranMasuk(query: LaporanModel.QueryBulanTahun): Promise<LaporanModel.LaporanPembayaranMasuk[]> {
        try {
            const start = new Date(query.tahun, query.bulan - 1, 1);
            const end = new Date(query.tahun, query.bulan, 1);

            const payments = await this.prisma.payment.findMany({
                where: {
                    payment_date: { gte: start, lt: end },
                    is_delete: false,
                    ...(query.id_pelanggan && { id_pelanggan: parseInt(query.id_pelanggan as any) }),
                },
                include: {
                    pelanggan: true,
                    invoice: true,
                },
                orderBy: { payment_date: 'asc' },
            });

            return payments.map(p => ({
                id_payment: p.id_payment,
                payment_number: p.payment_number,
                payment_date: p.payment_date,
                payment_amount: p.payment_amount,
                payment_method: p.payment_method,
                full_name: p.pelanggan?.full_name,
                invoice_number: p.invoice?.invoice_number,
            }));
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async getRekapitulasiPenjualan(query: LaporanModel.QueryBulanTahun): Promise<LaporanModel.RekapitulasiPenjualan> {
        try {
            const start = new Date(query.tahun, query.bulan - 1, 1);
            const end = new Date(query.tahun, query.bulan, 1);

            const invoices = await this.prisma.invoice.findMany({
                where: {
                    invoice_date: { gte: start, lt: end },
                    is_deleted: false,
                    ...(query.id_pelanggan && { id_pelanggan: parseInt(query.id_pelanggan as any) }),
                },
            });

            const total_penjualan = invoices.reduce((sum, inv) => sum + inv.total, 0);
            const total_invoice = invoices.length;
            const total_piutang = invoices.reduce((sum, inv) => sum + (inv.total - inv.bayar), 0);

            return {
                bulan: `${query.tahun}-${String(query.bulan).padStart(2, '0')}`,
                total_penjualan,
                total_invoice,
                total_piutang,
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async getCustomerPiutangTerbanyak(): Promise<LaporanModel.CustomerPiutangTerbanyak[]> {
        try {
            const invoices = await this.prisma.invoice.findMany({
                where: {
                    is_deleted: false,
                },
                include: {
                    pelanggan: true,
                },
            });

            const map = new Map<number, LaporanModel.CustomerPiutangTerbanyak>();

            for (const inv of invoices) {
                const id = inv.id_pelanggan;
                const existing = map.get(id);
                const unpaid = inv.total - inv.bayar;

                if (!existing) {
                    map.set(id, {
                        id_pelanggan: id,
                        full_name: inv.pelanggan.full_name,
                        total_piutang: unpaid,
                    });
                } else {
                    existing.total_piutang += unpaid;
                }
            }

            return Array.from(map.values()).sort((a, b) => b.total_piutang - a.total_piutang).slice(0, 10);
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async getRiwayatPembayaran(id_pelanggan: number): Promise<LaporanModel.RiwayatPembayaran[]> {
        try {
            const payments = await this.prisma.payment.findMany({
                where: {
                    id_pelanggan,
                    is_delete: false,
                },
                include: {
                    pelanggan: true,
                    invoice: true,
                },
                orderBy: { payment_date: 'desc' },
            });

            return payments.map(p => ({
                id_payment: p.id_payment,
                payment_date: p.payment_date,
                payment_number: p.payment_number,
                full_name: p.pelanggan?.full_name,
                payment_amount: p.payment_amount,
                invoice_number: p.invoice?.invoice_number,
            }));
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }
}
