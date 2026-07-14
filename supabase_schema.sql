-- SQL migration script to set up schema in Supabase (idempotent/re-runnable version)

-- 1. Create triggers for automatically updating "updatedAt"
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Create "Company" table
CREATE TABLE IF NOT EXISTS "Company" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_company_updated_at ON "Company";
CREATE TRIGGER update_company_updated_at
    BEFORE UPDATE ON "Company"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Create "User" table (linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY, -- Will hold the Supabase auth.users ID
    "email" TEXT UNIQUE NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Counselor',
    "password" TEXT NOT NULL, -- Used as a placeholder / local fallback
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Create "Lead" table
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "lastStudyLevel" TEXT,
    "preferredStudyLevel" TEXT,
    "preferredCountry" TEXT,
    "preferredCourse" TEXT,
    "preferredIntake" TEXT,
    
    -- English Proficiency
    "englishTestStatus" TEXT,
    "englishTestType" TEXT,
    "englishTestScore" TEXT,
    
    -- Academic Details
    "sscGroup" TEXT,
    "sscYear" TEXT,
    "sscResult" TEXT,
    "hscGroup" TEXT,
    "hscYear" TEXT,
    "hscResult" TEXT,
    "bachelorsMajor" TEXT,
    "bachelorsYear" TEXT,
    "bachelorsCgpa" TEXT,
    "mastersMajor" TEXT,
    "mastersYear" TEXT,
    "mastersCgpa" TEXT,
    
    "workExperience" TEXT,
    "source" TEXT,
    "budget" TEXT,
    "initialNote" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'New',
    "rating" TEXT DEFAULT 'Unrated',
    "isFileOpened" BOOLEAN NOT NULL DEFAULT false,
    "fileOpenedAt" TIMESTAMP WITH TIME ZONE,
    "contactedAt" TIMESTAMP WITH TIME ZONE,
    "assignedAt" TIMESTAMP WITH TIME ZONE,
    
    "assignedCounselorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "createdById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_lead_updated_at ON "Lead";
CREATE TRIGGER update_lead_updated_at
    BEFORE UPDATE ON "Lead"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create "Interaction" table
CREATE TABLE IF NOT EXISTS "Interaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
    "counselorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_interaction_updated_at ON "Interaction";
CREATE TRIGGER update_interaction_updated_at
    BEFORE UPDATE ON "Interaction"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Create "Task" table
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT REFERENCES "Lead"("id") ON DELETE CASCADE,
    "counselorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_task_updated_at ON "Task";
CREATE TRIGGER update_task_updated_at
    BEFORE UPDATE ON "Task"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create "Course" table
CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_course_updated_at ON "Course";
CREATE TRIGGER update_course_updated_at
    BEFORE UPDATE ON "Course"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Create "Batch" table
CREATE TABLE IF NOT EXISTS "Batch" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "courseId" TEXT NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "instructorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_batch_updated_at ON "Batch";
CREATE TRIGGER update_batch_updated_at
    BEFORE UPDATE ON "Batch"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Create "BatchEnrollment" table
CREATE TABLE IF NOT EXISTS "BatchEnrollment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
    "batchId" TEXT NOT NULL REFERENCES "Batch"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL DEFAULT 'Enrolled',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_batchenrollment_updated_at ON "BatchEnrollment";
CREATE TRIGGER update_batchenrollment_updated_at
    BEFORE UPDATE ON "BatchEnrollment"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_company ON "User"("companyId");
CREATE INDEX IF NOT EXISTS idx_lead_company ON "Lead"("companyId");
CREATE INDEX IF NOT EXISTS idx_lead_assigned ON "Lead"("assignedCounselorId");
CREATE INDEX IF NOT EXISTS idx_interaction_lead ON "Interaction"("leadId");
CREATE INDEX IF NOT EXISTS idx_task_counselor ON "Task"("counselorId");
CREATE INDEX IF NOT EXISTS idx_task_lead ON "Task"("leadId");
CREATE INDEX IF NOT EXISTS idx_course_company ON "Course"("companyId");
CREATE INDEX IF NOT EXISTS idx_batch_course ON "Batch"("courseId");
CREATE INDEX IF NOT EXISTS idx_enrollment_lead ON "BatchEnrollment"("leadId");
CREATE INDEX IF NOT EXISTS idx_enrollment_batch ON "BatchEnrollment"("batchId");
