/*
  Warnings:

  - You are about to drop the column `order` on the `Poems` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Poems_poet_id_order_id_idx";

-- DropIndex
DROP INDEX "Poets_name_en_key";

-- AlterTable
ALTER TABLE "Poems" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "Poets" ALTER COLUMN "bio" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Poems_poet_id_id_idx" ON "Poems"("poet_id", "id");
