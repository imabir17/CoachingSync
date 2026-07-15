-- 1. Alter "User" table
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';

-- 2. Update helper functions to verify active status
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS text AS $$
    DECLARE
        cid text;
    BEGIN
        -- Try to read from JWT app_metadata
        cid := (auth.jwt() -> 'app_metadata'::text ->> 'companyId')::text;
        IF cid IS NOT NULL THEN
            RETURN cid;
        END IF;

        -- Fall back to database query if JWT is missing the claim
        SELECT "companyId" INTO cid FROM "User" WHERE id = auth.uid()::text AND status = 'Active';
        RETURN cid;
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
    DECLARE
        u_role text;
    BEGIN
        -- Try to read from JWT app_metadata
        u_role := (auth.jwt() -> 'app_metadata'::text ->> 'role')::text;
        IF u_role IS NOT NULL THEN
            RETURN u_role = 'Super Admin';
        END IF;

        -- Fall back to database query
        RETURN EXISTS (
            SELECT 1 FROM "User" 
            WHERE id = auth.uid()::text AND role = 'Super Admin' AND status = 'Active'
        );
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create "Invite" table
CREATE TABLE IF NOT EXISTS "Invite" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'Counselor', -- 'Manager' or 'Counselor'
  "token" TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  "invitedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "status" TEXT NOT NULL DEFAULT 'Pending', -- Pending, Accepted, Revoked
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create trigger to auto-update "updatedAt" in "Invite"
DROP TRIGGER IF EXISTS update_invite_updated_at ON "Invite";
CREATE TRIGGER update_invite_updated_at
BEFORE UPDATE ON "Invite"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Create "ActivityLog" table
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "actorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL, -- 'company.created', 'user.invited', 'invite.accepted', 'user.role_changed', 'user.deactivated'
  "entityType" TEXT,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invite_company ON "Invite"("companyId");
CREATE INDEX IF NOT EXISTS idx_invite_token ON "Invite"("token");
CREATE INDEX IF NOT EXISTS idx_activitylog_company ON "ActivityLog"("companyId");

-- 7. RLS Setup for "Invite" and "ActivityLog"
ALTER TABLE "Invite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admins and Managers can manage invites" ON "Invite";
CREATE POLICY "Super Admins and Managers can manage invites" ON "Invite"
FOR ALL TO authenticated
USING (
  "companyId" = get_my_company_id()
  AND (is_super_admin() OR EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'Manager' AND status = 'Active'
  ))
);

DROP POLICY IF EXISTS "Company members can read activity log" ON "ActivityLog";
CREATE POLICY "Company members can read activity log" ON "ActivityLog"
FOR SELECT TO authenticated
USING ("companyId" = get_my_company_id());
