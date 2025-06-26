export namespace LaporanModel {
    export class QueryBulanTahun {
        bulan?: number; // 1 - 12
        tahun?: number; // ex: 2025
        id_pelanggan?: number;
    }

    export class LaporanPiutangCustomer {
        id_pelanggan: number;
        full_name: string;
        alamat: string;
        invoice_number: string;
        invoice_date: Date;
        total_tagihan_max_30_day: number;
        total_tagihan_max_60_day: number;
        total_tagihan_max_90_day: number;
        total_tagihan_more_90_day: number;
    }

    export class GetLaporanPiutangCustomer {
        status: boolean;
        message: string;
        data: LaporanPiutangCustomer[];
    }

    export class LaporanPembayaranMasuk {
        id_payment: number;
        payment_number: string;
        payment_date: Date;
        payment_amount: number;
        payment_method: string;
        full_name: string;
        invoice_number: string;
    }

    export class RekapitulasiPenjualan {
        bulan: string;
        total_penjualan: number;
        total_invoice: number;
        total_piutang: number;
    }

    export class CustomerPiutangTerbanyak {
        id_pelanggan: number;
        full_name: string;
        total_piutang: number;
    }

    export class RiwayatPembayaran {
        id_payment: number;
        payment_date: Date;
        payment_number: string;
        full_name: string;
        payment_amount: number;
        invoice_number: string;
    }
}
