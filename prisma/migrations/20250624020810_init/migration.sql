-- CreateTable
CREATE TABLE "user" (
    "id_user" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "last_login" TIMESTAMP(3),
    "last_logout" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "pelanggan" (
    "id_pelanggan" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "identity_number" TEXT,
    "alamat" TEXT,
    "phone" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_blacklist" BOOLEAN NOT NULL DEFAULT false,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "is_delete" BOOLEAN DEFAULT false,
    "delete_at" TIMESTAMP(3),
    "delete_by" INTEGER,

    CONSTRAINT "pelanggan_pkey" PRIMARY KEY ("id_pelanggan")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id_invoice" SERIAL NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "id_pelanggan" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "bayar" DOUBLE PRECISION NOT NULL,
    "koreksi" DOUBLE PRECISION DEFAULT 0,
    "kembali" DOUBLE PRECISION DEFAULT 0,
    "is_cash" BOOLEAN NOT NULL DEFAULT true,
    "invoice_status" TEXT NOT NULL DEFAULT 'PENDING',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "delete_at" TIMESTAMP(3),
    "delete_by" INTEGER,
    "is_lunas" BOOLEAN NOT NULL DEFAULT false,
    "lunas_at" TIMESTAMP(3),

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id_invoice")
);

-- CreateTable
CREATE TABLE "invoice_detail" (
    "id_invoice_detail" SERIAL NOT NULL,
    "id_invoice" INTEGER NOT NULL,
    "kode_product" TEXT NOT NULL,
    "nama_product" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "qty" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "diskon_percentage" DOUBLE PRECISION DEFAULT 0,
    "diskon_rupiah" DOUBLE PRECISION DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "delete_at" TIMESTAMP(3),
    "delete_by" INTEGER,

    CONSTRAINT "invoice_detail_pkey" PRIMARY KEY ("id_invoice_detail")
);

-- CreateTable
CREATE TABLE "payment" (
    "id_payment" SERIAL NOT NULL,
    "id_invoice" INTEGER NOT NULL,
    "id_pelanggan" INTEGER,
    "payment_number" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id_payment")
);

-- CreateTable
CREATE TABLE "log_activity_user" (
    "id_log_activity_user" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "request_body" JSONB,
    "ip_address" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_activity_user_pkey" PRIMARY KEY ("id_log_activity_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_detail" ADD CONSTRAINT "invoice_detail_id_invoice_fkey" FOREIGN KEY ("id_invoice") REFERENCES "invoice"("id_invoice") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_id_invoice_fkey" FOREIGN KEY ("id_invoice") REFERENCES "invoice"("id_invoice") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_activity_user" ADD CONSTRAINT "log_activity_user_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
