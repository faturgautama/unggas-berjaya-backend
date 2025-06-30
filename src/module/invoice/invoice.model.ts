import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export namespace InvoiceModel {
    export class IInvoice {
        id_invoice: number;
        invoice_number: string;
        invoice_date: Date;
        id_pelanggan: number;
        full_name: string;
        total: number;
        bayar: number;
        koreksi: number;
        kembali: number;
        is_cash: boolean;
        invoice_status: string;
        sudah_terbayar: number;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
        is_deleted: boolean;
        delete_at: Date;
        delete_by: number;
        is_lunas: boolean;
        lunas_at: Date;
    }

    export enum InvoiceStatus {
        PENDING = 'PENDING',
        EXPIRED = 'EXPIRED',
        CANCEL = 'CANCEL',
        PAID = 'PAID',
    }

    export class IInvoiceQueryParams {
        invoice_number?: string;
        invoice_date?: string;
        full_name?: string;
        invoice_status?: string;
        search?: string;
        page: number;
        limit: number;
    }

    export class IInvoiceMetadata {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    }

    export class GetAllInvoice {
        status: boolean;
        message: string;
        data: IInvoice[]
        meta: IInvoiceMetadata
    }

    export class GetByIdInvoice {
        status: boolean;
        message: string;
        data: IInvoice;
    }

    export class SyncInvoice {
        insert: any[];
        update: any[];
        softDelete: string[];
    }
}