import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export namespace PelangganModel {
    export class IPelanggan {
        id_pelanggan: number;
        ref_id: string;
        full_name: string;
        identity_number: string;
        alamat: string;
        phone: string;
        is_active: boolean;
        is_blacklist: boolean;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class IPelangganQueryParams {
        search?: string;
        is_active?: boolean;
    }

    export class GetAllPelanggan {
        status: boolean;
        message: string;
        data: IPelanggan[]
    }

    export class GetByIdPelanggan {
        status: boolean;
        message: string;
        data: IPelanggan;
    }

    export class CreatePelanggan {
        @IsNotEmpty()
        @IsString()
        full_name: string;

        @IsOptional()
        @IsString()
        identity_number: string;

        @IsOptional()
        @IsString()
        alamat: string;

        @IsOptional()
        @IsString()
        phone: string;
    }

    export class UpdatePelanggan {
        @IsNotEmpty()
        @IsNumber()
        id_pelanggan: number;

        @IsNotEmpty()
        @IsString()
        full_name: string;

        @IsOptional()
        @IsString()
        identity_number: string;

        @IsOptional()
        @IsString()
        alamat: string;

        @IsOptional()
        @IsString()
        phone: string;

        @IsNotEmpty()
        @IsBoolean()
        is_active: boolean;

        @IsNotEmpty()
        @IsBoolean()
        is_blacklist: boolean;
    }

    export class ISyncCreateUpdatePelanggan {
        @IsNotEmpty()
        @IsString()
        ref_id: string;

        @IsNotEmpty()
        @IsString()
        full_name: string;
    }

    export class SyncPelanggan {
        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => ISyncCreateUpdatePelanggan)
        insert: ISyncCreateUpdatePelanggan[];

        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => ISyncCreateUpdatePelanggan)
        update: ISyncCreateUpdatePelanggan[];

        @IsArray()
        @IsString({ each: true })
        softDelete: string[];
    }

}

