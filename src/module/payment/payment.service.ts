import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaymentModel } from './payment.model';
import { PrismaService } from 'src/prisma.service';
import { UtilityService } from 'src/helper/utility/utility.service';
import { Request } from 'express';

@Injectable()
export class PaymentService {

    constructor(
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
    ) { }

    async getAll(query: PaymentModel.IPaymentQueryParams): Promise<PaymentModel.GetAllPayment> {
        try {

            const { page = 1, limit = 10, search, ...rest } = query;

            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            const queries: any = {
                ...rest,
                is_delete: false,
            };

            // 1. Advanced filter object
            let newQueries: any = {
                AND: [], // We'll push advanced filters here
            };

            // 2. Parse and build individual field filters
            Object.entries(queries).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') return;

                if (key === 'is_delete') {
                    newQueries.AND.push({ is_delete: false });
                } else if (key === 'invoice_date') {
                    const date = new Date(value as any);
                    const start = new Date(date.getFullYear(), date.getMonth(), 1);
                    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                    newQueries.AND.push({
                        invoice_date: {
                            gt: start,
                            lt: end,
                        }
                    });
                } else if (key === 'payment_date') {
                    const date = new Date(value as any);
                    const start = new Date(date.getFullYear(), date.getMonth(), 1);
                    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                    newQueries.AND.push({
                        payment_date: {
                            gt: start,
                            lt: end,
                        }
                    });
                } else if (key === 'invoice_number' || key === 'payment_number') {
                    newQueries.AND.push({
                        [key]: {
                            contains: value,
                            mode: 'insensitive'
                        }
                    });
                }
            });

            // 3. Global search
            if (queries.search && typeof queries.search === 'string') {
                const s = queries.search.trim();
                const isValidDate = !isNaN(Date.parse(s));

                const globalSearchOR: any[] = [
                    { invoice_number: { contains: s, mode: 'insensitive' } },
                    { payment_number: { contains: s, mode: 'insensitive' } },
                    { pelanggan: { full_name: { contains: s, mode: 'insensitive' } } },
                ];

                if (isValidDate) {
                    globalSearchOR.push({
                        invoice_date: {
                            equals: new Date(s)
                        }
                    });
                }

                newQueries.OR = globalSearchOR;
            };

            const [res, total] = await this._prismaService.$transaction([
                this._prismaService.payment.findMany({
                    where: newQueries,
                    include: {
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                alamat: true,
                            }
                        },
                        invoice: {
                            select: {
                                invoice_date: true,
                                invoice_number: true,
                            },
                        }
                    },
                    orderBy: {
                        payment_date: 'asc'
                    },
                    skip,
                    take
                }),
                this._prismaService.payment.count({
                    where: newQueries
                })
            ]);

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_payment: item.id_payment,
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice ? item.invoice.invoice_number : null,
                        invoice_date: item.invoice ? item.invoice.invoice_date : null,
                        id_pelanggan: item.id_pelanggan,
                        full_name: item.pelanggan.full_name,
                        alamat: item.pelanggan.alamat,
                        payment_date: item.payment_date,
                        payment_method: item.payment_method,
                        payment_number: item.payment_number,
                        payment_amount: item.payment_amount,
                        potongan: item.potongan,
                        total: item.total,
                        notes: item.notes,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
                    }
                }),
                meta: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    total_pages: Math.ceil(total / Number(limit)),
                }
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

    async getById(id_payment: number): Promise<any> {
        try {
            let res = await this._prismaService
                .payment
                .findMany({
                    where: { id_payment: parseInt(id_payment as any) },
                    include: {
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                            }
                        },
                        invoice: {
                            select: {
                                invoice_date: true,
                                invoice_number: true,
                            },
                        }
                    },
                    orderBy: {
                        payment_date: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_payment: item.id_payment,
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice.invoice_number,
                        invoice_date: item.invoice.invoice_date,
                        id_pelanggan: item.id_pelanggan,
                        full_name: item.pelanggan.full_name,
                        payment_date: item.payment_date,
                        payment_method: item.payment_method,
                        payment_number: item.payment_number,
                        payment_amount: item.payment_amount,
                        potongan: item.potongan,
                        total: item.total,
                        notes: item.notes,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
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

    async create(req: Request, payload: PaymentModel.CreatePayment): Promise<any> {
        try {
            const userId = parseInt(req['user']['id_user'] as any);
            const { id_invoice, payment_date, ...rest } = payload;

            // Ambil id_pelanggan dari invoice
            const invoice = await this._prismaService.invoice.findUnique({
                where: { id_invoice },
                select: { id_pelanggan: true, invoice_status: true }
            });

            if (!invoice) {
                return {
                    status: false,
                    message: 'Invoice tidak ditemukan'
                }
            }

            if (invoice && invoice.invoice_status != 'BELUM TERBAYAR') {
                return {
                    status: false,
                    message: 'Invoice sudah terbayar'
                }
            }

            const id_pelanggan = invoice.id_pelanggan;

            const paymentDate = new Date(payment_date);
            const year = paymentDate.getFullYear();
            const month = paymentDate.getMonth();

            // Hitung jumlah payment untuk pelanggan ini pada bulan dan tahun yang sama
            const countThisMonth = await this._prismaService.payment.count({
                where: {
                    id_pelanggan,
                    is_delete: false,
                    payment_date: {
                        gte: new Date(year, month, 1),
                        lt: new Date(year, month + 1, 1),
                    }
                }
            });

            const newPaymentNumber = `PMB-${countThisMonth + 1}-${id_pelanggan}-${year}`;

            const res = await this._prismaService.payment.create({
                data: {
                    ...rest,
                    id_invoice,
                    id_pelanggan,
                    payment_date: paymentDate,
                    payment_number: newPaymentNumber,
                    create_at: new Date(),
                    create_by: userId
                }
            });

            if (!res) {
                return {
                    status: false,
                    message: 'Payment gagal disimpan',
                    data: res
                };
            }

            const updateInvoice = await this._prismaService
                .invoice
                .update({
                    where: {
                        id_invoice: parseInt(res.id_invoice as any)
                    },
                    data: {
                        bayar: parseFloat(res.total as any),
                        invoice_status: 'LUNAS',
                        lunas_at: new Date(),
                        is_lunas: true,
                        source: 'system',
                        update_at: new Date(),
                        update_by: userId
                    }
                });

            if (!updateInvoice) {
                return {
                    status: false,
                    message: 'Payment gagal disimpan',
                    data: res
                };
            }

            return {
                status: true,
                message: 'Payment berhasil disimpan',
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

    async update(req: Request, payload: PaymentModel.UpdatePayment): Promise<any> {
        try {
            const { id_payment, id_invoice, payment_number, ...data } = payload;

            let res = await this._prismaService
                .payment
                .update({
                    where: { id_payment: parseInt(id_payment as any) },
                    data: {
                        ...data,
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
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

    async delete(req: Request, id_payment: string): Promise<any> {
        try {
            const payment = await this._prismaService.payment.findFirst({
                where: {
                    id_payment: parseInt(id_payment as any)
                },
                select: {
                    id_invoice: true
                }
            });

            if (!payment) {
                return {
                    status: false,
                    message: 'Payment tidak ditemukan',
                    data: id_payment
                };
            }

            const updateInvoice = await this._prismaService
                .invoice
                .update({
                    where: {
                        id_invoice: parseInt(payment.id_invoice as any)
                    },
                    data: {
                        invoice_status: 'BELUM TERBAYAR',
                        lunas_at: null,
                        is_lunas: false,
                        source: 'legacy',
                        update_at: null
                    }
                });

            if (!updateInvoice) {
                return {
                    status: false,
                    message: 'Payment gagal dihapus',
                    data: id_payment
                };
            }

            let res = await this._prismaService
                .payment
                .update({
                    where: { id_payment: parseInt(id_payment as any) },
                    data: {
                        is_delete: true,
                        delete_at: new Date(),
                        delete_by: parseInt(req['user']['id_user'] as any)
                    }
                });

            if (!res) {
                return {
                    status: false,
                    message: 'Delete payment failed',
                    data: null
                }
            }

            return {
                status: true,
                message: 'Delete payment success',
                data: res.id_payment
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
