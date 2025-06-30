import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { DashboardModel } from './dashboard.model';
import { subDays, format, eachDayOfInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';

@Injectable({ scope: Scope.TRANSIENT })
export class DashboardService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getDashboardCount(req: Request): Promise<DashboardModel.GetDashboardCount> {
        try {
            let res: DashboardModel.IDashboardCount = {
                pelanggan: 0,
                invoice: 0,
                mitra: 3,
                payment: 0
            };

            res.pelanggan = await this._prismaService
                .pelanggan
                .count({
                    where: {
                        is_active: true,
                    }
                });

            res.invoice = await this._prismaService
                .invoice
                .count({
                    where: {
                        invoice_status: 'BELUM TERBAYAR',
                    }
                });

            res.payment = await this._prismaService
                .invoice
                .count({
                    where: {
                        invoice_status: 'LUNAS',
                    }
                });

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getDashboardPaymentWeekly(req: Request, start_date: string, end_date: string): Promise<DashboardModel.GetDashboardPaymentWeekly> {
        try {
            // Generate array of dates from start_date to end_date
            const dates = eachDayOfInterval({
                start: new Date(start_date),
                end: new Date(end_date)
            }).map(date => ({
                date: format(date, 'yyyy-MM-dd'), // Format date as YYYY-MM-DD
                total: 0
            }));

            let res: DashboardModel.IDashboardPaymentWeekly[] = dates;

            // Fetch payments from the database
            const payments = await this._prismaService.invoice.findMany({
                where: {
                    invoice_status: 'LUNAS',
                    create_at: {
                        gte: `${start_date}T00:00:00.000Z`,
                        lte: `${end_date}T23:59:59.999Z`,
                    }
                },
            });

            // Sum the payment amounts by date
            payments.forEach(payment => {
                const paymentDate = format(new Date(payment.create_at), 'yyyy-MM-dd'); // Extract date

                // Find the corresponding date in `res` and add the total
                const dateEntry = res.find(entry => entry.date === paymentDate);
                if (dateEntry) {
                    dateEntry.total += payment.bayar;
                }
            });

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getDashboardPaymentMonthly(req: Request, date: string): Promise<DashboardModel.GetDashboardPaymentWeekly> {
        try {
            // Calculate the first and last day of the given month
            const start_date = format(startOfMonth(new Date(date)), 'yyyy-MM-dd');
            const end_date = format(endOfMonth(new Date(date)), 'yyyy-MM-dd');

            // Generate array of dates for the whole month
            const dates = eachDayOfInterval({
                start: new Date(start_date),
                end: new Date(end_date)
            }).map(day => ({
                date: format(day, 'yyyy-MM-dd'),
                total: 0
            }));

            let res: DashboardModel.IDashboardPaymentWeekly[] = dates;

            // Fetch payments from the database within the month
            const payments = await this._prismaService.invoice.findMany({
                where: {
                    invoice_status: 'LUNAS',
                    create_at: {
                        gte: `${start_date}T00:00:00.000Z`,
                        lte: `${end_date}T23:59:59.999Z`,
                    }
                },
            });

            // Sum the payment amounts by date
            payments.forEach(payment => {
                const paymentDate = format(new Date(payment.create_at), 'yyyy-MM-dd'); // Extract date

                // Find the corresponding date in `res` and add the total
                const dateEntry = res.find(entry => entry.date === paymentDate);
                if (dateEntry) {
                    dateEntry.total += payment.bayar;
                }
            });

            return {
                status: true,
                message: '',
                data: res
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
                    message: error.message
                },
                status
            );
        }
    }

    async getDashboardPaymentYearly(req: Request, year: string): Promise<DashboardModel.GetDashboardPaymentYearly> {
        try {
            const start_date = new Date(`${year}-01-01T00:00:00.000Z`);
            const end_date = new Date(`${year}-12-31T23:59:59.999Z`);

            // Initialize months with both PAID and PENDING fields
            const months = Array.from({ length: 12 }, (_, index) => {
                const month = (index + 1).toString().padStart(2, '0');
                return {
                    month: `${year}-${month}`,
                    total_paid: 0,
                    total_unpaid: 0
                };
            });

            let res: DashboardModel.IDashboardPaymentYearly[] = months;

            // Get all payments (PAID or PENDING) in the year
            const payments = await this._prismaService.invoice.findMany({
                where: {
                    invoice_status: {
                        in: ['LUNAS', 'BELUM TERBAYAR']
                    },
                    create_at: {
                        gte: start_date,
                        lte: end_date,
                    },
                },
                select: {
                    create_at: true,
                    total: true,
                    invoice_status: true
                }
            });

            // Group totals by month and status
            payments.forEach(payment => {
                const monthKey = format(new Date(payment.create_at), 'yyyy-MM');
                const entry = res.find(item => item.month === monthKey);
                if (entry) {
                    if (payment.invoice_status === 'LUNAS') {
                        entry.total_paid += payment.total;
                    } else if (payment.invoice_status === 'BELUM TERBAYAR') {
                        entry.total_unpaid += payment.total;
                    }
                }
            });

            return {
                status: true,
                message: '',
                data: res
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
                    message: error.message
                },
                status
            );
        }
    }

    async getLatestPayment(req: Request): Promise<any> {
        try {
            // Fetch payments from the database within the month
            const payments = await this._prismaService.payment.findMany({
                where: {
                    is_delete: false,
                },
                orderBy: {
                    create_at: 'asc'
                },
                take: 10,
                include: {
                    invoice: {
                        select: {
                            invoice_number: true,
                            total: true,
                        }
                    },
                    pelanggan: {
                        select: {
                            id_pelanggan: true,
                            full_name: true,
                            alamat: true,
                        }
                    },
                },
            });

            return {
                status: true,
                message: '',
                data: payments.map((item) => {
                    return {
                        id_payment: item.id_payment,
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice.invoice_number,
                        total: item.invoice.total,
                        id_pelanggan: item.id_pelanggan,
                        full_name: item.pelanggan.full_name,
                        alamat: item.pelanggan.alamat,
                        create_at: item.create_at,
                    }
                })
            }


        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }
}
