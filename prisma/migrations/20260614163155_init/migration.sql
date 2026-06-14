-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateTable
CREATE TABLE "Countries" (
    "id" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aliases" TEXT[],

    CONSTRAINT "Countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eras" (
    "id" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aliases" TEXT[],

    CONSTRAINT "Eras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quawafi" (
    "id" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aliases" TEXT[],

    CONSTRAINT "Quawafi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seas" (
    "id" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aliases" TEXT[],

    CONSTRAINT "Seas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topics" (
    "id" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aliases" TEXT[],

    CONSTRAINT "Topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoemsTypes" (
    "id" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aliases" TEXT[],

    CONSTRAINT "PoemsTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poems" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "poet_id" INTEGER NOT NULL,
    "topic_id" INTEGER,
    "poem_type_id" INTEGER,
    "sea_id" INTEGER,
    "quafia_id" INTEGER,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoemsLines" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "content_nd" TEXT NOT NULL,
    "poem_id" INTEGER NOT NULL,
    "poet_id" INTEGER NOT NULL,
    "line_type" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoemsLines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poets" (
    "id" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "era_id" INTEGER,
    "country_id" INTEGER,
    "gender" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_poems_name_trgm" ON "Poems" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Poems_poet_id_order_id_idx" ON "Poems"("poet_id", "order", "id");

-- CreateIndex
CREATE INDEX "idx_poems_topic_id" ON "Poems"("topic_id");

-- CreateIndex
CREATE INDEX "idx_poems_type_id" ON "Poems"("poem_type_id");

-- CreateIndex
CREATE INDEX "idx_poems_sea_id" ON "Poems"("sea_id");

-- CreateIndex
CREATE INDEX "idx_poems_quafia_id" ON "Poems"("quafia_id");

-- CreateIndex
CREATE INDEX "idx_poemslines_content_trgm" ON "PoemsLines" USING GIN ("content" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poemslines_content_nd_trgm" ON "PoemsLines" USING GIN ("content_nd" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poemslines_poem_id_order" ON "PoemsLines"("poem_id", "order");

-- CreateIndex
CREATE INDEX "idx_poemslines_poet_id_order" ON "PoemsLines"("poet_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Poets_name_en_key" ON "Poets"("name_en");

-- CreateIndex
CREATE INDEX "idx_poets_name_ar_trgm" ON "Poets" USING GIN ("name_ar" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poets_bio_trgm" ON "Poets" USING GIN ("bio" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poets_name_en_trgm" ON "Poets" USING GIN ("name_en" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_poets_gender" ON "Poets"("gender");

-- CreateIndex
CREATE INDEX "idx_poets_era_id" ON "Poets"("era_id");

-- CreateIndex
CREATE INDEX "idx_poets_country_id" ON "Poets"("country_id");

-- AddForeignKey
ALTER TABLE "Poems" ADD CONSTRAINT "Poems_poet_id_fkey" FOREIGN KEY ("poet_id") REFERENCES "Poets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poems" ADD CONSTRAINT "Poems_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poems" ADD CONSTRAINT "Poems_poem_type_id_fkey" FOREIGN KEY ("poem_type_id") REFERENCES "PoemsTypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poems" ADD CONSTRAINT "Poems_sea_id_fkey" FOREIGN KEY ("sea_id") REFERENCES "Seas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poems" ADD CONSTRAINT "Poems_quafia_id_fkey" FOREIGN KEY ("quafia_id") REFERENCES "Quawafi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoemsLines" ADD CONSTRAINT "PoemsLines_poem_id_fkey" FOREIGN KEY ("poem_id") REFERENCES "Poems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoemsLines" ADD CONSTRAINT "PoemsLines_poet_id_fkey" FOREIGN KEY ("poet_id") REFERENCES "Poets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poets" ADD CONSTRAINT "Poets_era_id_fkey" FOREIGN KEY ("era_id") REFERENCES "Eras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poets" ADD CONSTRAINT "Poets_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
