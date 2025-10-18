-- CreateEnum
CREATE TYPE "period_type_enum" AS ENUM ('short', 'mid', 'long');

-- CreateTable
CREATE TABLE "stocks" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "index" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "stock_name" VARCHAR(255) NOT NULL,
    "mean_absolute_error" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_more_risk" BOOLEAN NOT NULL DEFAULT false,
    "period_type" "period_type_enum" NOT NULL DEFAULT 'short',
    "date_of_creation" DATE NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stocks_name_date_key" ON "stocks"("name", "date");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_portfolioId_stock_name_key" ON "prediction"("portfolioId", "stock_name");

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
