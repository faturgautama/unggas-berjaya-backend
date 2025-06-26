import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModel } from './authentication.model';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable({ scope: Scope.TRANSIENT })
export class AuthenticationService {

    constructor(
        private _jwtService: JwtService,
        private _prismaService: PrismaService,
    ) { }

    async login(username: string, password: string): Promise<AuthenticationModel.Login> {
        try {
            const user = await this._prismaService.user.findFirst({
                where: {
                    username: username,
                    is_active: true
                },
            });

            if (!user) {
                return {
                    status: false,
                    message: "User Tidak Ditemukan",
                    data: null,
                }
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return {
                    status: false,
                    message: "Mohon Periksa Email / Password Anda",
                    data: null,
                }
            };

            const updateLastLogin = await this._prismaService
                .user
                .update({
                    where: {
                        id_user: parseInt(user.id_user as any),
                    },
                    data: {
                        last_login: new Date(),
                        last_logout: null
                    }
                });

            if (!updateLastLogin) {
                return {
                    status: false,
                    message: "Gagal Update Waktu Login",
                    data: null,
                }
            };

            let token: string = "", data: any = null;

            token = this._jwtService.sign({
                id_user: user.id_user,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                whatsapp: user.whatsapp,
                notes: user.notes,
            });


            return {
                status: true,
                message: "OK",
                data: {
                    id_user: user.id_user,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    whatsapp: user.whatsapp,
                    notes: user.notes,
                    token: token,
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

    async logout(req: Request): Promise<any> {
        try {
            const updateLastLogout = await this._prismaService
                .user
                .update({
                    where: {
                        id_user: parseInt(req['user']['id_user'] as any),
                    },
                    data: {
                        last_login: null,
                        last_logout: new Date(),
                    }
                });

            if (!updateLastLogout) {
                return {
                    status: false,
                    message: "Gagal Update Waktu Logout",
                    data: null,
                }
            };

            return {
                status: true,
                message: "OK",
                data: updateLastLogout
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

    async register(req: Request, payload: AuthenticationModel.IRegisterPayload): Promise<{ status: boolean, message: string, data: any }> {
        try {
            let data = null, isUserExist = null;

            console.log("req =>", req['user']);

            isUserExist = await this._prismaService.user.findFirst({
                where: {
                    username: payload.username
                }
            });

            if (isUserExist) {
                return {
                    status: false,
                    message: "Username Sudah Terdaftar",
                    data: null,
                }
            };

            const salt = await bcrypt.genSalt();

            const createUser = await this._prismaService.user.create({
                data: {
                    username: payload.username,
                    email: payload.email,
                    password: await bcrypt.hash(payload.password, salt),
                    full_name: payload.full_name,
                    address: payload.address,
                    phone: payload.phone,
                    whatsapp: payload.whatsapp,
                    notes: payload.notes,
                    create_at: new Date(),
                    create_by: parseInt(req['user']['id_user']),
                    is_active: true,
                }
            });

            if (createUser) {
                return {
                    status: true,
                    message: "User Berhasil Didaftarkan",
                    data: null,
                }
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

    async getProfile(req: Request): Promise<any> {
        try {
            let result = await this._prismaService
                .user
                .findUnique({
                    where: {
                        id_user: parseInt(req['user']['id_user'])
                    }
                });

            return {
                status: true,
                message: 'OK',
                data: result
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

    async updateProfile(req: Request, payload: AuthenticationModel.UpdateProfile): Promise<any> {
        try {
            let res = await this._prismaService
                .user
                .update({
                    where: { id_user: parseInt(req['user']['id_user'] as any) },
                    data: {
                        ...payload,
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
                    }
                });

            if (!res) {
                return {
                    status: false,
                    message: 'Profile Gagal Diperbarui',
                    data: null
                }
            }

            return {
                status: true,
                message: 'OK',
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
}
