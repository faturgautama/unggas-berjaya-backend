import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InvoiceModel } from './invoice.model';
import { Request } from 'express';

import { UtilityService } from 'src/helper/utility/utility.service';

@Injectable({ scope: Scope.TRANSIENT })
export class InvoiceService {

    constructor(
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
    ) { }

    async getAll(req: Request, query: InvoiceModel.IInvoiceQueryParams): Promise<InvoiceModel.GetAllInvoice> {
        try {
            const { page = 1, limit = 10, search, ...rest } = query;

            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            const queries: any = {
                ...rest,
                is_deleted: false,
            };

            // 1. Advanced filter object
            let newQueries: any = {
                AND: [], // We'll push advanced filters here
            };

            // 2. Parse and build individual field filters
            Object.entries(queries).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') return;

                if (key === 'is_deleted') {
                    newQueries.AND.push({ is_deleted: false });
                } else if (['id_invoice', 'id_product', 'id_setting_company', 'id_pelanggan'].includes(key)) {
                    newQueries.AND.push({ [key]: parseInt(value as any) });
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
                } else if (key === 'invoice_number' || key === 'invoice_status') {
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
                    { invoice_status: { contains: s, mode: 'insensitive' } },
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
            }

            const [res, total] = await this._prismaService.$transaction([
                this._prismaService.invoice.findMany({
                    where: newQueries,
                    include: {
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                            }
                        },
                        payment: {
                            where: {
                                is_delete: false,
                            },
                            select: {
                                id_payment: true,
                                payment_date: true,
                                payment_method: true,
                            },
                            take: 1,
                        }
                    },
                    orderBy: {
                        invoice_date: 'asc'
                    },
                    skip,
                    take
                }),
                this._prismaService.invoice.count({ where: newQueries })
            ]);

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice_number,
                        invoice_date: item.invoice_date,
                        id_pelanggan: item.id_pelanggan,
                        full_name: item.pelanggan.full_name,
                        total: item.total,
                        bayar: item.bayar,
                        koreksi: item.koreksi,
                        kembali: item.kembali,
                        is_cash: item.is_cash,
                        invoice_status: item.invoice_status,
                        id_payment: item.payment.length ? item.payment[0].id_payment : null,
                        payment_date: item.payment.length ? item.payment[0].payment_date : null,
                        payment_method: item.payment.length ? item.payment[0].payment_method : null,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
                        is_deleted: item.is_deleted,
                        delete_at: item.delete_at,
                        delete_by: item.delete_by,
                        is_lunas: item.is_lunas,
                        lunas_at: item.lunas_at,
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

    async getById(id_invoice: number): Promise<any> {
        try {
            let res: any = await this._prismaService
                .invoice
                .findUnique({
                    where: { id_invoice: parseInt(id_invoice as any) },
                    include: {
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                alamat: true,
                                phone: true,
                            }
                        },
                        payment: {
                            select: {
                                id_payment: true,
                                payment_date: true,
                                payment_method: true,
                                payment_amount: true
                            }
                        },
                        invoice_detail: {
                            where: {
                                is_deleted: false
                            },
                        }
                    },
                });

            if (!res) {
                return {
                    status: false,
                    message: 'Faktur Penjualan Tidak Ditemukan',
                }
            }

            return {
                status: true,
                message: '',
                data: {
                    id_invoice: res.id_invoice,
                    invoice_number: res.invoice_number,
                    invoice_date: res.invoice_date,
                    id_pelanggan: res.id_pelanggan,
                    full_name: res.pelanggan.full_name,
                    phone: res.pelanggan.phone,
                    alamat: res.pelanggan.alamat,
                    total: res.total,
                    bayar: res.bayar,
                    koreksi: res.koreksi,
                    kembali: res.kembali,
                    is_cash: res.is_cash,
                    invoice_status: res.invoice_status,
                    id_payment: res.payment.length ? res.payment[0].id_payment : null,
                    payment_date: res.payment.length ? res.payment[0].payment_date : null,
                    payment_method: res.payment.length ? res.payment[0].payment_method : null,
                    create_at: res.create_at,
                    create_by: res.create_by,
                    update_at: res.update_at,
                    update_by: res.update_by,
                    is_deleted: res.is_deleted,
                    delete_at: res.delete_at,
                    delete_by: res.delete_by,
                    is_lunas: res.is_lunas,
                    lunas_at: res.lunas_at,
                    detail: res.invoice_detail
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

    async syncInvoice(payload: InvoiceModel.SyncInvoice) {
        try {
            const { insert, update, softDelete } = payload;

            // 🔄 INSERT
            for (const invoice of insert) {
                const existing = await this._prismaService.invoice.findFirst({
                    where: { invoice_number: invoice.invoice_number },
                });

                if (existing) continue;

                const created = await this._prismaService.invoice.create({
                    data: {
                        invoice_number: invoice.invoice_number,
                        invoice_date: new Date(invoice.invoice_date),
                        id_pelanggan: invoice.id_pelanggan,
                        total: invoice.total,
                        bayar: invoice.bayar,
                        koreksi: invoice.koreksi,
                        kembali: invoice.kembali,
                        is_cash: invoice.is_cash,
                        is_lunas: invoice.is_lunas,
                        lunas_at: invoice.lunas_at ? new Date(invoice.lunas_at) : null,
                        create_by: invoice.create_by,
                        create_at: new Date(),
                        invoice_status: invoice.is_lunas ? 'LUNAS' : 'BELUM TERBAYAR',
                        source: 'legacy',
                        source_sync_at: new Date(),
                    },
                });

                await Promise.all(
                    invoice.invoice_detail.map((detail) =>
                        this._prismaService.invoice_detail.create({
                            data: {
                                id_invoice: created.id_invoice,
                                kode_product: detail.kode_product,
                                nama_product: detail.nama_product,
                                price: detail.price,
                                qty: detail.qty,
                                weight: detail.weight,
                                diskon_percentage: detail.diskon_percentage ?? 0,
                                diskon_rupiah: detail.diskon_rupiah ?? 0,
                                total: detail.total,
                                create_by: detail.create_by,
                                create_at: new Date(),
                            },
                        })
                    )
                );
            }

            // ✏️ UPDATE if changed
            for (const invoice of update) {
                const existing = await this._prismaService.invoice.findFirst({
                    where: { invoice_number: invoice.invoice_number, is_deleted: false },
                    include: { invoice_detail: true },
                });

                if (!existing) continue;

                if (existing.source && existing.source !== 'legacy') continue;

                const isMainDiff =
                    new Date(invoice.invoice_date).toISOString() !== existing.invoice_date.toISOString() ||
                    invoice.id_pelanggan !== existing.id_pelanggan ||
                    invoice.total !== existing.total ||
                    invoice.bayar !== existing.bayar ||
                    (invoice.koreksi ?? 0) !== (existing.koreksi ?? 0) ||
                    (invoice.kembali ?? 0) !== (existing.kembali ?? 0) ||
                    invoice.is_cash !== existing.is_cash ||
                    invoice.is_lunas !== existing.is_lunas ||
                    (invoice.lunas_at ? new Date(invoice.lunas_at).toISOString() : null) !==
                    (existing.lunas_at ? existing.lunas_at.toISOString() : null);

                const existingDetails = existing.invoice_detail.map((d) => ({
                    kode_product: d.kode_product,
                    nama_product: d.nama_product,
                    price: d.price,
                    qty: d.qty,
                    weight: d.weight,
                    diskon_percentage: d.diskon_percentage ?? 0,
                    diskon_rupiah: d.diskon_rupiah ?? 0,
                    total: d.total,
                }));

                const incomingDetails = invoice.invoice_detail.map((d) => ({
                    kode_product: d.kode_product,
                    nama_product: d.nama_product,
                    price: d.price,
                    qty: d.qty,
                    weight: d.weight,
                    diskon_percentage: d.diskon_percentage ?? 0,
                    diskon_rupiah: d.diskon_rupiah ?? 0,
                    total: d.total,
                }));

                const isDetailDiff = JSON.stringify(existingDetails) !== JSON.stringify(incomingDetails);

                if (!isMainDiff && !isDetailDiff) {
                    continue;
                }

                await this._prismaService.invoice.update({
                    where: { id_invoice: existing.id_invoice },
                    data: {
                        invoice_date: new Date(invoice.invoice_date),
                        id_pelanggan: invoice.id_pelanggan,
                        total: invoice.total,
                        bayar: invoice.bayar,
                        koreksi: invoice.koreksi,
                        kembali: invoice.kembali,
                        is_cash: invoice.is_cash,
                        is_lunas: invoice.is_lunas,
                        lunas_at: invoice.lunas_at ? new Date(invoice.lunas_at) : null,
                        update_by: invoice.create_by,
                        update_at: new Date(),
                        invoice_status: invoice.is_lunas ? 'LUNAS' : 'BELUM TERBAYAR',
                        source: 'legacy',
                        source_sync_at: new Date(),
                    },
                });

                await this._prismaService.invoice_detail.deleteMany({
                    where: { id_invoice: existing.id_invoice },
                });

                await Promise.all(
                    invoice.invoice_detail.map((detail) =>
                        this._prismaService.invoice_detail.create({
                            data: {
                                id_invoice: existing.id_invoice,
                                kode_product: detail.kode_product,
                                nama_product: detail.nama_product,
                                price: detail.price,
                                qty: detail.qty,
                                weight: detail.weight,
                                diskon_percentage: detail.diskon_percentage ?? 0,
                                diskon_rupiah: detail.diskon_rupiah ?? 0,
                                total: detail.total,
                                create_by: detail.create_by,
                                create_at: new Date(),
                            },
                        })
                    )
                );
            }

            // 🗑️ SOFT DELETE
            if (softDelete.length > 0) {
                await this._prismaService.invoice.updateMany({
                    where: {
                        invoice_number: { in: softDelete },
                        is_deleted: false,
                    },
                    data: {
                        is_deleted: true,
                        delete_at: new Date(),
                        delete_by: 9999,
                    },
                });
            }

            return {
                status: true,
                message: 'Sync invoice berhasil',
                data: {
                    inserted: insert.length,
                    updated: update.length,
                    softDeleted: softDelete.length,
                },
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

    async getInvoiceNumbers() {
        const list = await this._prismaService.invoice.findMany({
            select: { invoice_number: true },
            where: { is_deleted: false },
        });
        return {
            status: true,
            data: list.map(i => i.invoice_number),
        };
    }
}
