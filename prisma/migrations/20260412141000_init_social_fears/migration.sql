-- CreateEnum
CREATE TYPE "InstrumentKind" AS ENUM ('SOCIAL_ANXIETY', 'LIEBOWITZ_MODIFIED', 'AUTHOR_SOCIAL_FEARS');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "StudyGroup" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL DEFAULT '',
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "submittedAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "instrument" "InstrumentKind" NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answer" JSONB NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "instrument" "InstrumentKind" NOT NULL,
    "scores" JSONB NOT NULL,
    "interpretation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "instrument" "InstrumentKind" NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "meta" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyGroup_code_key" ON "StudyGroup"("code");

-- CreateIndex
CREATE INDEX "Participant_groupId_idx" ON "Participant"("groupId");

-- CreateIndex
CREATE INDEX "Participant_lastName_firstName_idx" ON "Participant"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_groupId_lastName_firstName_middleName_key" ON "Participant"("groupId", "lastName", "firstName", "middleName");

-- CreateIndex
CREATE INDEX "AssessmentSession_participantId_idx" ON "AssessmentSession"("participantId");

-- CreateIndex
CREATE INDEX "AssessmentSession_groupId_idx" ON "AssessmentSession"("groupId");

-- CreateIndex
CREATE INDEX "AssessmentSession_status_idx" ON "AssessmentSession"("status");

-- CreateIndex
CREATE INDEX "AssessmentSession_submittedAt_idx" ON "AssessmentSession"("submittedAt");

-- CreateIndex
CREATE INDEX "Response_sessionId_idx" ON "Response"("sessionId");

-- CreateIndex
CREATE INDEX "Response_instrument_idx" ON "Response"("instrument");

-- CreateIndex
CREATE UNIQUE INDEX "Response_sessionId_instrument_questionKey_key" ON "Response"("sessionId", "instrument", "questionKey");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_sessionId_idx" ON "ScoreSnapshot"("sessionId");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_instrument_idx" ON "ScoreSnapshot"("instrument");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreSnapshot_sessionId_instrument_key" ON "ScoreSnapshot"("sessionId", "instrument");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBank_key_key" ON "QuestionBank"("key");

-- CreateIndex
CREATE INDEX "QuestionBank_instrument_idx" ON "QuestionBank"("instrument");

-- CreateIndex
CREATE INDEX "QuestionBank_isActive_idx" ON "QuestionBank"("isActive");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
