-- CreateEnum
CREATE TYPE "Media" AS ENUM ('Image', 'Video');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "media" "Media" NOT NULL,
    "nombre_like" INTEGER NOT NULL,
    "authorId" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
