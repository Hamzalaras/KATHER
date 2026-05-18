-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateTable
CREATE TABLE "Poems" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "engTopic" TEXT NOT NULL,
    "arabTopic" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "engSea" TEXT NOT NULL,
    "arabSea" TEXT NOT NULL,
    "quafia" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poetId" INTEGER NOT NULL,

    CONSTRAINT "Poems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoemsLines" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "contentNoDiacritics" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poemId" INTEGER NOT NULL,

    CONSTRAINT "PoemsLines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poets" (
    "id" INTEGER NOT NULL,
    "engName" TEXT NOT NULL,
    "arabName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "engEra" TEXT NOT NULL,
    "arabEra" TEXT NOT NULL,
    "engCountry" TEXT NOT NULL,
    "arabCountry" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_poems_name_trgm" ON "Poems" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poems_engtopic" ON "Poems"("engTopic");

-- CreateIndex
CREATE INDEX "idx_poems_arabtopic" ON "Poems"("arabTopic");

-- CreateIndex
CREATE INDEX "idx_poems_type" ON "Poems"("type");

-- CreateIndex
CREATE INDEX "idx_poems_engsea" ON "Poems"("engSea");

-- CreateIndex
CREATE INDEX "idx_poems_arabsea" ON "Poems"("arabSea");

-- CreateIndex
CREATE INDEX "idx_poems_quafia" ON "Poems"("quafia");

-- CreateIndex
CREATE INDEX "idx_poems_poetid" ON "Poems"("poetId");

-- CreateIndex
CREATE INDEX "idx_poems_poetid_order" ON "Poems"("poetId", "order");

-- CreateIndex
CREATE INDEX "idx_poemslines_content_trgm" ON "PoemsLines" USING GIN ("content" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poemslines_contentnodiacritics_trgm" ON "PoemsLines" USING GIN ("contentNoDiacritics" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poemslines_poemid" ON "PoemsLines"("poemId");

-- CreateIndex
CREATE INDEX "idx_poemslines_poemid_order" ON "PoemsLines"("poemId", "order");

-- CreateIndex
CREATE INDEX "idx_poemslines_poemid_type_order" ON "PoemsLines"("poemId", "type", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Poets_engName_key" ON "Poets"("engName");

-- CreateIndex
CREATE INDEX "idx_poets_arabname_trgm" ON "Poets" USING GIN ("arabName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poets_bio_trgm" ON "Poets" USING GIN ("bio" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poets_engname_trgm" ON "Poets" USING GIN ("engName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poets_gender" ON "Poets"("gender");

-- CreateIndex
CREATE INDEX "idx_poets_engera" ON "Poets"("engEra");

-- CreateIndex
CREATE INDEX "idx_poets_arabera" ON "Poets"("arabEra");

-- CreateIndex
CREATE INDEX "idx_poets_engcountry" ON "Poets"("engCountry");

-- CreateIndex
CREATE INDEX "idx_poets_arabcountry" ON "Poets"("arabCountry");

-- AddForeignKey
ALTER TABLE "Poems" ADD CONSTRAINT "Poems_poetId_fkey" FOREIGN KEY ("poetId") REFERENCES "Poets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoemsLines" ADD CONSTRAINT "PoemsLines_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
