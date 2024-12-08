/*
  Warnings:

  - A unique constraint covering the columns `[videoId,userId]` on the table `Liked` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Liked_videoId_userId_key" ON "Liked"("videoId", "userId");
