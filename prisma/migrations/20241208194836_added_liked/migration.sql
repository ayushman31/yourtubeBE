-- CreateTable
CREATE TABLE "Liked" (
    "id" SERIAL NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Liked_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Liked" ADD CONSTRAINT "Liked_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
