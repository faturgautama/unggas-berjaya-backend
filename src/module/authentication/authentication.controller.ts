import { Body, Controller, Get, HttpStatus, Put, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationModel } from './authentication.model';
import { AuthenticationService } from './authentication.service';
import { Request, Response } from 'express';
import { JwtGuard } from './jwt.guard';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {

    constructor(
        private _authenticationService: AuthenticationService,
    ) { }

    @Post('login')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.Login })
    async login(@Body() body: AuthenticationModel.ILoginPayload, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.login(body.username, body.password);
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

    @Get('logout')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.Login })
    async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.logout(req);
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

    @Post('register')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.Login })
    async register(@Body() body: AuthenticationModel.IRegisterPayload, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.register(req, body);
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

    @Get('profile')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.GetProfile })
    async getProfile(@Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.getProfile(req);
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

    @Put('profile')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.GetProfile })
    async updateProfile(@Body() body: AuthenticationModel.UpdateProfile, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.updateProfile(req, body);
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
