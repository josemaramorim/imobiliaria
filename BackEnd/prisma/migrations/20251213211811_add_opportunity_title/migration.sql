-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- DropIndex
DROP INDEX "_LeadTags_AB_unique";

-- DropIndex
DROP INDEX "_LeadTags_B_index";

-- DropIndex
DROP INDEX "_OpportunityTags_AB_unique";

-- DropIndex
DROP INDEX "_OpportunityTags_B_index";

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "_LeadTags" ADD CONSTRAINT "_LeadTags_pkey" PRIMARY KEY ("leadId", "tagId");

-- AlterTable
ALTER TABLE "_OpportunityTags" ADD CONSTRAINT "_OpportunityTags_pkey" PRIMARY KEY ("opportunityId", "tagId");

-- RenameForeignKey
ALTER TABLE "_LeadTags" RENAME CONSTRAINT "_LeadTags_A_fkey" TO "_LeadTags_leadId_fkey";

-- RenameForeignKey
ALTER TABLE "_LeadTags" RENAME CONSTRAINT "_LeadTags_B_fkey" TO "_LeadTags_tagId_fkey";

-- RenameForeignKey
ALTER TABLE "_OpportunityTags" RENAME CONSTRAINT "_OpportunityTags_A_fkey" TO "_OpportunityTags_opportunityId_fkey";

-- RenameForeignKey
ALTER TABLE "_OpportunityTags" RENAME CONSTRAINT "_OpportunityTags_B_fkey" TO "_OpportunityTags_tagId_fkey";
