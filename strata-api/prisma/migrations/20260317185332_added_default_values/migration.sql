-- AlterTable
ALTER TABLE "Follows" ALTER COLUMN "status" SET DEFAULT 'ACCEPTED';

-- AlterTable
ALTER TABLE "Friendship" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "banner" SET DEFAULT '/assets/images/default-trip-banner.png',
ALTER COLUMN "visibility" SET DEFAULT 'PRIVATE',
ALTER COLUMN "travel_style" SET DEFAULT 'ADVENTURE',
ALTER COLUMN "rating" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "photo" SET DEFAULT '/assets/images/default-avatar.png';
