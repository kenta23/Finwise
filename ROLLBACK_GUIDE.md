# Prisma Rollback Guide

## ⚠️ Important: `db push` vs `migrate dev`

- **`prisma db push`**: Pushes schema changes directly to the database WITHOUT creating migration files. **Harder to rollback.**
- **`prisma migrate dev`**: Creates migration files that can be tracked and rolled back. **Recommended for production.**

---

## 🔄 Rolling Back After `db push`

Since `db push` doesn't create migration files, you have a few options:

### Option 1: Manual SQL Rollback (Quick Fix)

1. **Identify what changed** by comparing your current schema with a previous version (Git history, backup, etc.)

2. **Write reverse SQL** to undo the changes:
   ```sql
   -- Example: If you added a column
   ALTER TABLE "savings" DROP COLUMN IF EXISTS "new_column_name";
   
   -- Example: If you changed a column type
   ALTER TABLE "savings" ALTER COLUMN "accountNumber" TYPE INTEGER USING "accountNumber"::integer;
   
   -- Example: If you added a table
   DROP TABLE IF EXISTS "new_table_name";
   ```

3. **Run the SQL** directly on your database:
   ```bash
   # Using psql
   psql $DATABASE_URL -f rollback.sql
   
   # Or using Prisma Studio
   npx prisma studio
   ```

### Option 2: Create a Migration to Rollback (Recommended)

1. **Revert your schema.prisma** to the previous state (use Git):
   ```bash
   git checkout HEAD~1 prisma/schema.prisma
   # Or manually edit schema.prisma to remove/add the changes
   ```

2. **Create a migration** that will sync your database back:
   ```bash
   npx prisma migrate dev --name rollback_changes
   ```

3. **Review the migration file** in `prisma/migrations/` to ensure it's correct

4. **Apply it**:
   ```bash
   npx prisma migrate deploy
   ```

### Option 3: Database Backup Restore (Nuclear Option)

If you have a backup from before the `db push`:
```bash
# Restore from backup (PostgreSQL example)
pg_restore -d your_database backup_file.dump
```

---

## ✅ Best Practice: Use Migrations Instead

**Instead of `db push`, use `migrate dev`:**

```bash
# 1. Make changes to schema.prisma
# 2. Create a migration
npx prisma migrate dev --name describe_your_changes

# 3. This creates a migration file you can review and rollback
```

### Rolling Back a Migration

If you used `migrate dev`, you can rollback:

1. **Check migration status**:
   ```bash
   npx prisma migrate status
   ```

2. **Manually rollback** by creating a new migration:
   ```bash
   # Revert schema.prisma first
   # Then create a new migration
   npx prisma migrate dev --name rollback_previous_change
   ```

3. **Or use migrate resolve** (if migration failed):
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

---

## 🔍 Finding What Changed

1. **Check Git history**:
   ```bash
   git diff HEAD~1 prisma/schema.prisma
   ```

2. **Compare with database**:
   ```bash
   npx prisma db pull
   # This will show you the current database state
   ```

3. **Use Prisma Migrate Diff**:
   ```bash
   npx prisma migrate diff \
     --from-schema-datamodel prisma/schema.prisma \
     --to-schema-datasource prisma/schema.prisma \
     --script
   ```

---

## 📝 Example: Rolling Back a Column Change

**Scenario**: You changed `accountNumber` from `Int?` to `String?` using `db push`

**Rollback Steps**:

1. **Edit schema.prisma** to revert:
   ```prisma
   accountNumber Int?  // Change back from String?
   ```

2. **Create migration**:
   ```bash
   npx prisma migrate dev --name rollback_account_number_type
   ```

3. **Review the generated migration** in `prisma/migrations/`

4. **The migration will contain**:
   ```sql
   ALTER TABLE "savings" ALTER COLUMN "accountNumber" TYPE INTEGER USING "accountNumber"::integer;
   ```

---

## 🚨 Prevention: Use Migrations Going Forward

Add to your workflow:
- ✅ Use `prisma migrate dev` for schema changes
- ✅ Review migration files before applying
- ✅ Test migrations on a development database first
- ❌ Avoid `db push` in production (use only for prototyping)




