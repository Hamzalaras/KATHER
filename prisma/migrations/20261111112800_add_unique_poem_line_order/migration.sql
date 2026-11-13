/*
  Warnings:

  - A unique constraint covering the columns `[poem_id,order]` on the table `PoemsLines` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PoemsLines_poem_id_order_key" ON "PoemsLines"("poem_id", "order");
