import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { PelangganModel } from './pelanggan.model';

@Injectable({ scope: Scope.TRANSIENT })
export class PelangganService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: PelangganModel.IPelangganQueryParams): Promise<PelangganModel.GetAllPelanggan> {
        try {
            let searchTerm = query.search?.toString().trim();

            let newQueries: any = {};

            if (query.is_active !== undefined) {
                newQueries.is_active = JSON.parse(query.is_active as any);
            };

            if (searchTerm) {
                newQueries.OR = [
                    {
                        full_name: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        alamat: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        phone: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                ]
            };

            newQueries.is_delete = false;

            let res: any[] = await this._prismaService
                .pelanggan
                .findMany({
                    where: newQueries,
                    orderBy: {
                        id_pelanggan: 'asc'
                    },
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

    async getById(id_pelanggan: number): Promise<PelangganModel.GetByIdPelanggan> {
        try {
            let res: any = await this._prismaService
                .pelanggan
                .findUnique({
                    where: { id_pelanggan: parseInt(id_pelanggan as any) }
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

    async create(req: Request, payload: PelangganModel.CreatePelanggan): Promise<any> {
        try {
            let res = await this._prismaService
                .pelanggan
                .create({
                    data: {
                        ref_id: `UB${new Date().getTime()}`,
                        full_name: payload.full_name,
                        phone: "",
                        alamat: "",
                        create_at: new Date(),
                        create_by: parseInt(req['user']['id_user'] as any)
                    }
                })

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

    async update(req: Request, payload: PelangganModel.UpdatePelanggan): Promise<any> {
        try {
            const { id_pelanggan, ...data } = payload;

            let res = await this._prismaService
                .pelanggan
                .update({
                    where: { id_pelanggan: parseInt(id_pelanggan as any) },
                    data: {
                        full_name: data.full_name,
                        identity_number: data.identity_number,
                        alamat: data.alamat,
                        phone: data.phone,
                        is_active: data.is_active,
                        is_blacklist: data.is_blacklist,
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
                    }
                })

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

    async delete(req: Request, id_pelanggan: string): Promise<any> {
        try {
            let res = await this._prismaService
                .pelanggan
                .update({
                    where: { id_pelanggan: parseInt(id_pelanggan as any) },
                    data: {
                        is_active: false,
                        is_delete: true,
                        delete_at: new Date(),
                        delete_by: parseInt(req['user']['id_user'] as any)
                    }
                });

            if (!res) {
                return {
                    status: false,
                    message: 'Delete pelanggan failed',
                    data: null
                }
            }

            return {
                status: true,
                message: 'Delete pelanggan success',
                data: res.id_pelanggan
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

    async syncAll(body: PelangganModel.SyncPelanggan) {
        try {
            const { insert, update, softDelete } = body;

            // Insert new pelanggan
            for (const p of insert) {
                await this._prismaService.pelanggan.create({
                    data: {
                        ref_id: p.ref_id,
                        full_name: p.full_name,
                        phone: "Belum Diatur",
                        alamat: "Belum Diatur",
                        create_by: 9999,
                    }
                });
            }

            // Update full_name
            for (const p of update) {
                await this._prismaService.pelanggan.updateMany({
                    where: { ref_id: p.ref_id },
                    data: {
                        full_name: p.full_name,
                        update_at: new Date(),
                        update_by: 9999,
                    }
                });
            }

            // Soft delete
            await this._prismaService.pelanggan.updateMany({
                where: {
                    ref_id: { in: softDelete },
                    is_delete: false,
                },
                data: {
                    is_delete: true,
                    delete_at: new Date(),
                    delete_by: 9999,
                }
            });

            return { status: true, message: "OK", data: null };

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
