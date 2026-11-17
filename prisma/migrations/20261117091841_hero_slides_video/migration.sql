/*
  Warnings:

  - You are about to drop the column `captionMeta` on the `hero` table. All the data in the column will be lost.
  - You are about to drop the column `captionTitle` on the `hero` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `hero` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "hero" DROP CONSTRAINT "hero_imageId_fkey";

-- AlterTable
ALTER TABLE "hero" DROP COLUMN "captionMeta",
DROP COLUMN "captionTitle",
DROP COLUMN "imageId";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE';

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "heroId" TEXT NOT NULL DEFAULT 'main',
    "mediaId" TEXT NOT NULL,
    "captionTitle" TEXT,
    "captionMeta" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_slides_heroId_sortOrder_idx" ON "hero_slides"("heroId", "sortOrder");

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
