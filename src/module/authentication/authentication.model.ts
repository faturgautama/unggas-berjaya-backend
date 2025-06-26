import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export namespace AuthenticationModel {
    export class ILoginPayload {
        @IsNotEmpty()
        @IsString()
        username: string;

        @IsNotEmpty()
        @IsString()
        password: string;
    }

    export class ILoginResponse {
        id_user: number;
        username: string;
        full_name: string;
        email: string;
        phone: string;
        whatsapp: string;
        notes: string;
        token: string;
    }

    export class Login {
        status: boolean;
        message: string;
        data: ILoginResponse;
    }

    export class IRegisterPayload {
        @IsNotEmpty()
        @IsString()
        full_name: string;

        @IsNotEmpty()
        @IsString()
        username: string;

        @IsNotEmpty()
        @IsString()
        password: string;

        @IsNotEmpty()
        @IsEmail()
        email: string;

        @IsOptional()
        @IsString()
        address?: string;

        @IsOptional()
        @IsString()
        phone?: string;

        @IsOptional()
        @IsString()
        whatsapp?: string;

        @IsOptional()
        @IsString()
        notes?: string;
    }

    export class IProfile {
        id_user: number;
        username: string;
        full_name: string;
        email: string;
        password: string;
        phone: string;
        whatsapp: string;
        notes: string;
    }

    export class GetProfile {
        status: boolean;
        message: string;
        data: IProfile;
    }

    export class UpdateProfile {
        @IsOptional()
        @IsString()
        full_name: string;

        @IsOptional()
        @IsString()
        username: string;

        @IsOptional()
        @IsString()
        password: string;

        @IsOptional()
        @IsEmail()
        email: string;

        @IsOptional()
        @IsString()
        address?: string;

        @IsOptional()
        @IsString()
        phone?: string;

        @IsOptional()
        @IsString()
        whatsapp?: string;

        @IsOptional()
        @IsString()
        notes?: string;
    }
}