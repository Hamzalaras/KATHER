-- CreateTable
CREATE TABLE "PoemAudio" (
    "id" SERIAL NOT NULL,
    "poem_id" INTEGER NOT NULL,
    "audio_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoemAudio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoemAudio_poem_id_key" ON "PoemAudio"("poem_id");

-- AddForeignKey
ALTER TABLE "PoemAudio" ADD CONSTRAINT "PoemAudio_poem_id_fkey" FOREIGN KEY ("poem_id") REFERENCES "Poems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
