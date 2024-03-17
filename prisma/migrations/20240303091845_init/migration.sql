-- CreateTable
CREATE TABLE "stocks" (
    "id" SERIAL NOT NULL,
    "index" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);
