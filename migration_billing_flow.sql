-- SQL migration script to set up billing, branches, plans and payments

-- 1. Create Plans table
CREATE TABLE IF NOT EXISTS "Plan" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,                    
  "billingCycle" TEXT NOT NULL,            
  "priceUsd" NUMERIC(10,2) NOT NULL,
  "setupFeeUsd" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "userLimit" INTEGER,                     
  "leadLimitPerMonth" INTEGER,             
  "isPublic" BOOLEAN NOT NULL DEFAULT true, 
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Plans
INSERT INTO "Plan" ("name", "billingCycle", "priceUsd", "setupFeeUsd", "userLimit", "leadLimitPerMonth", "isPublic") VALUES
  ('Free',          'free',    0,   0,  2,   100,  true),   
  ('Basic Monthly', 'monthly', 35,  20, 20,  NULL, true),
  ('Pro Monthly',   'monthly', 70,  20, 100, NULL, true),
  ('Basic Yearly',  'yearly',  399, 0,  20,  NULL, true),
  ('Pro Yearly',    'yearly',  799, 0,  100, NULL, true),
  ('Custom',        'custom',  0,   0,  NULL, NULL, false)
ON CONFLICT DO NOTHING;

-- 2. Create Branch table
CREATE TABLE IF NOT EXISTS "Branch" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL DEFAULT 'Main Branch',
  "isDefault" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "branchId" TEXT NOT NULL REFERENCES "Branch"("id") ON DELETE CASCADE,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, 
  "planId" TEXT NOT NULL REFERENCES "Plan"("id"),
  "status" TEXT NOT NULL DEFAULT 'active',
  "overrideUserLimit" INTEGER,   
  "overrideLeadLimit" INTEGER,   
  "isCustom" BOOLEAN NOT NULL DEFAULT false, 
  "currentPeriodStart" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,          
  "graceEndsAt" TIMESTAMP WITH TIME ZONE,               
  "setupFeePaid" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_branch ON "Subscription"("branchId");
CREATE INDEX IF NOT EXISTS idx_subscription_company ON "Subscription"("companyId");
CREATE INDEX IF NOT EXISTS idx_subscription_status_period ON "Subscription"("status", "currentPeriodEnd");

-- 4. Create PaymentMethodConfig table
CREATE TABLE IF NOT EXISTS "PaymentMethodConfig" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "method" TEXT NOT NULL UNIQUE,  
  "number" TEXT NOT NULL,
  "accountType" TEXT,             
  "instructions" TEXT,            
  "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- Seed Payment Methods
INSERT INTO "PaymentMethodConfig" ("method", "number", "accountType", "instructions") VALUES
  ('bKash', '01700000001', 'Personal', 'Send Money, not Payment. Keep the transaction ID.'),
  ('Nagad', '01700000002', 'Personal', 'Send Money, not Payment. Keep the transaction ID.'),
  ('Rocket', '01700000003-1', 'Personal', 'Send Money, not Payment. Keep the transaction ID.')
ON CONFLICT ("method") DO NOTHING;

-- 5. Create Payments table
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "subscriptionId" TEXT NOT NULL REFERENCES "Subscription"("id") ON DELETE CASCADE,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "planId" TEXT NOT NULL REFERENCES "Plan"("id"),        
  "amountUsd" NUMERIC(10,2) NOT NULL,
  "includesSetupFee" BOOLEAN NOT NULL DEFAULT false,
  "method" TEXT NOT NULL,          
  "transactionNumber" TEXT NOT NULL,
  "submittedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "status" TEXT NOT NULL DEFAULT 'pending', 
  "reviewedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL, 
  "reviewedAt" TIMESTAMP WITH TIME ZONE,
  "reviewNotes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_subscription ON "Payment"("subscriptionId");
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"("status");

-- 6. Create SubscriptionNotification table
CREATE TABLE IF NOT EXISTS "SubscriptionNotification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "subscriptionId" TEXT NOT NULL REFERENCES "Subscription"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,   
  "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE ("subscriptionId", "type", "sentAt")
);

-- 7. Add isPlatformAdmin column to User table if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

-- 8. Lead limit enforce trigger
CREATE OR REPLACE FUNCTION check_lead_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_limit INTEGER;
  v_count INTEGER;
BEGIN
  SELECT COALESCE(s."overrideLeadLimit", p."leadLimitPerMonth")
  INTO v_limit
  FROM "Subscription" s JOIN "Plan" p ON p.id = s."planId"
  WHERE s."companyId" = NEW."companyId" AND s.status IN ('active', 'grace');

  IF v_limit IS NULL OR v_limit = -1 THEN
    RETURN NEW; -- unlimited
  END IF;

  SELECT count(*) INTO v_count FROM "Lead"
  WHERE "companyId" = NEW."companyId"
    AND "createdAt" >= date_trunc('month', timezone('utc'::text, now()));

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Monthly lead limit reached for this plan. Upgrade to add more leads.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_lead_limit ON "Lead";
CREATE TRIGGER enforce_lead_limit
BEFORE INSERT ON "Lead"
FOR EACH ROW EXECUTE FUNCTION check_lead_limit();

-- 9. Writability check helper function
CREATE OR REPLACE FUNCTION is_company_writable()
RETURNS boolean AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status FROM "Subscription" WHERE "companyId" = get_my_company_id();
  IF v_status IS NULL THEN
    RETURN true;
  END IF;
  RETURN v_status IN ('active', 'grace');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Branch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentMethodConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionNotification" ENABLE ROW LEVEL SECURITY;

-- 11. Define select/write policies for new tables
DROP POLICY IF EXISTS "Anyone authenticated can read active plans" ON "Plan";
CREATE POLICY "Anyone authenticated can read active plans" ON "Plan"
FOR SELECT TO authenticated USING ("isActive" = true AND "isPublic" = true);

DROP POLICY IF EXISTS "Company members read their branches" ON "Branch";
CREATE POLICY "Company members read their branches" ON "Branch"
FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());

DROP POLICY IF EXISTS "Company members read their subscription" ON "Subscription";
CREATE POLICY "Company members read their subscription" ON "Subscription"
FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());

DROP POLICY IF EXISTS "Anyone authenticated can read active payment methods" ON "PaymentMethodConfig";
CREATE POLICY "Anyone authenticated can read active payment methods" ON "PaymentMethodConfig"
FOR SELECT TO authenticated USING ("isActive" = true);

DROP POLICY IF EXISTS "Company members submit payments" ON "Payment";
CREATE POLICY "Company members submit payments" ON "Payment"
FOR INSERT TO authenticated WITH CHECK ("companyId" = get_my_company_id());

DROP POLICY IF EXISTS "Company members read their own payments" ON "Payment";
CREATE POLICY "Company members read their own payments" ON "Payment"
FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());

-- 12. Update RLS policies for existing tables to block writes if suspended
-- Drop ALL write policies
DROP POLICY IF EXISTS "Users can manage leads in their company" ON "Lead";
DROP POLICY IF EXISTS "Users can manage interactions in their company" ON "Interaction";
DROP POLICY IF EXISTS "Users can manage tasks in their company" ON "Task";
DROP POLICY IF EXISTS "Users can manage courses in their company" ON "Course";
DROP POLICY IF EXISTS "Users can manage batches in their company" ON "Batch";
DROP POLICY IF EXISTS "Users can manage enrollments in their company" ON "BatchEnrollment";
DROP POLICY IF EXISTS "Super Admins and Managers can manage invites" ON "Invite";

-- Re-create Split SELECT vs WRITE policies
-- Lead
CREATE POLICY "Company members select leads" ON "Lead"
    FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());
CREATE POLICY "Company members write leads" ON "Lead"
    FOR ALL TO authenticated USING ("companyId" = get_my_company_id() AND is_company_writable());

-- Interaction
CREATE POLICY "Company members select interactions" ON "Interaction"
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "Interaction"."leadId"
              AND "Lead"."companyId" = get_my_company_id()
        )
    );
CREATE POLICY "Company members write interactions" ON "Interaction"
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "Interaction"."leadId"
              AND "Lead"."companyId" = get_my_company_id()
        ) AND is_company_writable()
    );

-- Task
CREATE POLICY "Company members select tasks" ON "Task"
    FOR SELECT TO authenticated USING (
        "counselorId" = auth.uid()::text OR "counselorId" IN (
            SELECT id FROM "User" WHERE "companyId" = get_my_company_id()
        )
    );
CREATE POLICY "Company members write tasks" ON "Task"
    FOR ALL TO authenticated USING (
        (
            "counselorId" = auth.uid()::text OR "counselorId" IN (
                SELECT id FROM "User" WHERE "companyId" = get_my_company_id()
            )
        ) AND is_company_writable()
    );

-- Course
CREATE POLICY "Company members select courses" ON "Course"
    FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());
CREATE POLICY "Company members write courses" ON "Course"
    FOR ALL TO authenticated USING ("companyId" = get_my_company_id() AND is_company_writable());

-- Batch
CREATE POLICY "Company members select batches" ON "Batch"
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM "Course"
            WHERE "Course".id = "Batch"."courseId"
              AND "Course"."companyId" = get_my_company_id()
        )
    );
CREATE POLICY "Company members write batches" ON "Batch"
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM "Course"
            WHERE "Course".id = "Batch"."courseId"
              AND "Course"."companyId" = get_my_company_id()
        ) AND is_company_writable()
    );

-- BatchEnrollment
CREATE POLICY "Company members select enrollments" ON "BatchEnrollment"
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "BatchEnrollment"."leadId"
              AND "Lead"."companyId" = get_my_company_id()
        )
    );
CREATE POLICY "Company members write enrollments" ON "BatchEnrollment"
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "BatchEnrollment"."leadId"
              AND "Lead"."companyId" = get_my_company_id()
        ) AND is_company_writable()
    );

-- Invite
CREATE POLICY "Company members select invites" ON "Invite"
    FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());
CREATE POLICY "Admins manage invites" ON "Invite"
    FOR ALL TO authenticated USING (
        "companyId" = get_my_company_id()
        AND (is_super_admin() OR EXISTS (
            SELECT 1 FROM "User" 
            WHERE id = auth.uid()::text AND role = 'Manager' AND status = 'Active'
        ))
        AND is_company_writable()
    );
