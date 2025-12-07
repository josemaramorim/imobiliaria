/*
  Warnings:

  - Made the column `status` on table `Lead` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CustomFieldEntity" AS ENUM ('PROPERTY', 'LEAD');

-- AlterTable
ALTER TABLE "CustomFieldConfig" ADD COLUMN     "entity" "CustomFieldEntity" NOT NULL DEFAULT 'PROPERTY';

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "source" SET DEFAULT '',
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Novo',
ALTER COLUMN "isActive" SET DEFAULT true,
ALTER COLUMN "customValues" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "customValues" SET DEFAULT '{}';
