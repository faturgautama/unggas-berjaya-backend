import { HttpService } from '@nestjs/axios';
import { Injectable, Scope } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map, Observable, of } from 'rxjs';
import { PrismaService } from 'src/prisma.service';

@Injectable({ scope: Scope.TRANSIENT })
export class AxiosService {

    constructor(
        private readonly _httpService: HttpService,
        private readonly _prismaService: PrismaService,
    ) { }

    onAxiosRequest(params: any): Observable<any> {
        const axiosConfig: any = {
            method: params.method,
            url: params.url,
            headers: params.headers,
            data: params.data ? params.data : null,
            params: params.params ? params.params : null,
            validateStatus(status) {
                return status == 200 || status == 201;
            }
        };

        console.log("==============================================")
        console.log("request =>", axiosConfig);

        return this._httpService.request(axiosConfig).pipe(
            map(result => {
                return {
                    status: result.status == 200 || result.status == 201 ? true : false,
                    message: result.statusText,
                    data: result.data
                };
            }),
            catchError((error: any) => {
                console.log("==============================================")
                console.log("axios error =>", error.response.data);

                return of({
                    status: false,
                    message: error?.response?.statusText ?? 'Unexpected error',
                    data: error?.response?.data ?? null
                });
            })
        );
    }

}
