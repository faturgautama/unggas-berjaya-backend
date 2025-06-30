import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsInt } from 'class-validator';


export namespace PaymentModel {
    export class IPayment {
        id_payment: number;
        id_invoice: number;
        invoice_number: string;
        invoice_date: Date;
        id_pelanggan: number;
        full_name: string;
        payment_date: Date;
        payment_method: string;
        payment_number: string;
        payment_amount: number;
        notes: string;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class IPaymentQueryParams {
        invoice_number?: string;
        invoice_date?: string;
        payment_number?: string;
        payment_date?: string;
        full_name?: string;
        search?: string;
        page: number;
        limit: number;
    };

    export class IPaymentMetadata {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    }

    export class GetAllPayment {
        status: boolean;
        message: string;
        data: IPayment[];
        meta: IPaymentMetadata
    }

    export class GetByIdPayment {
        status: boolean;
        message: string;
        data: IPayment;
    }

    export class CreatePayment {
        @IsInt()
        @IsNotEmpty()
        id_invoice: number;

        @IsString()
        @IsNotEmpty()
        payment_number: string;

        @IsDateString()
        @IsNotEmpty()
        payment_date: string;

        @IsString()
        @IsNotEmpty()
        payment_method: string;

        @IsNumber()
        @IsNotEmpty()
        payment_amount: number;

        @IsNumber()
        @IsOptional()
        potongan: number;

        @IsNumber()
        @IsNotEmpty()
        total: number;

        @IsOptional()
        @IsString()
        notes?: string;
    }

    export class UpdatePayment {
        @IsInt()
        @IsNotEmpty()
        id_payment: number;

        @IsInt()
        @IsNotEmpty()
        id_invoice: number;

        @IsString()
        @IsNotEmpty()
        payment_number: string;

        @IsDateString()
        @IsNotEmpty()
        payment_date: string;

        @IsString()
        @IsNotEmpty()
        payment_method: string;

        @IsNumber()
        @IsNotEmpty()
        payment_amount: number;

        @IsNumber()
        @IsOptional()
        potongan: number;

        @IsNumber()
        @IsNotEmpty()
        total: number;

        @IsOptional()
        @IsString()
        notes?: string;
    }

}