-- Rename implicit many-to-many columns to explicit names
ALTER TABLE "_LeadTags" RENAME COLUMN "A" TO "leadId";
ALTER TABLE "_LeadTags" RENAME COLUMN "B" TO "tagId";

ALTER TABLE "_OpportunityTags" RENAME COLUMN "A" TO "opportunityId";
ALTER TABLE "_OpportunityTags" RENAME COLUMN "B" TO "tagId";
