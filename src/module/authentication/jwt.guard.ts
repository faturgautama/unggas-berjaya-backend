import { ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            let errorException = new HttpException(
                {
                    status: false,
                    message: 'Anda Belum Login',
                    data: '',
                },
                HttpStatus.OK
            );

            throw err || errorException;
        }
        return user;
    }
}