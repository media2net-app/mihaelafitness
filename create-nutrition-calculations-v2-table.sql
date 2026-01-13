-- Create nutrition_calculations_v2 table for KCAL Calculator V2
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "nutrition_calculations_v2" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "objectivePercentage" DOUBLE PRECISION NOT NULL,
    "dailyActivity" DOUBLE PRECISION NOT NULL,
    "trainingHours" DOUBLE PRECISION NOT NULL,
    "trainingIntensity" DOUBLE PRECISION NOT NULL,
    "step1_mb" DOUBLE PRECISION NOT NULL,
    "step2_gender" DOUBLE PRECISION NOT NULL,
    "step3_age" DOUBLE PRECISION NOT NULL,
    "step4_bodyType" DOUBLE PRECISION NOT NULL,
    "step5_objective" DOUBLE PRECISION NOT NULL,
    "step6_dailyActivity" DOUBLE PRECISION NOT NULL,
    "step7_training" DOUBLE PRECISION NOT NULL,
    "finalCalories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "calculationType" TEXT NOT NULL DEFAULT 'v2',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_calculations_v2_pkey" PRIMARY KEY ("id")
);

-- Create index on customerId for faster queries
CREATE INDEX IF NOT EXISTS "nutrition_calculations_v2_customerId_idx" ON "nutrition_calculations_v2"("customerId");

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS "nutrition_calculations_v2_createdAt_idx" ON "nutrition_calculations_v2"("createdAt");







