-- CreateTable
CREATE TABLE "PoemExplanations" (
    "id" SERIAL NOT NULL,
    "poem_id" INTEGER NOT NULL,
    "general_idea" TEXT NOT NULL,
    "themes" TEXT NOT NULL,
    "styles" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "raw_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoemExplanations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoemExplanations_poem_id_key" ON "PoemExplanations"("poem_id");

-- AddForeignKey
ALTER TABLE "PoemExplanations" ADD CONSTRAINT "PoemExplanations_poem_id_fkey" FOREIGN KEY ("poem_id") REFERENCES "Poems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
