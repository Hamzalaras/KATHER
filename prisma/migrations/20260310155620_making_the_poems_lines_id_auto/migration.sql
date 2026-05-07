-- Make PoemsLines.id auto-increment for seeding without manual IDs
CREATE SEQUENCE IF NOT EXISTS "PoemsLines_id_seq";
ALTER TABLE "PoemsLines"
    ALTER COLUMN "id" SET DEFAULT nextval('"PoemsLines_id_seq"');
ALTER SEQUENCE "PoemsLines_id_seq" OWNED BY "PoemsLines"."id";