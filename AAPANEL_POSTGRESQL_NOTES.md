# aaPanel PostgreSQL Compatibility Notes

## ✅ Extension Compatibility

This database schema is fully compatible with aaPanel's custom PostgreSQL builds.

### Extensions Used

**✅ pgcrypto** (Required)
- Used for UUID generation and encryption functions
- Compatible with aaPanel PostgreSQL builds
- Function: `gen_random_uuid()` for UUID generation

**❌ uuid-ossp** (NOT USED)
- Removed from schema for compatibility
- If you need UUID generation, use `gen_random_uuid()` from pgcrypto instead

---

## 🔧 Installation

### Step 1: Ensure pgcrypto is Available

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Check if pgcrypto is available
\dx pgcrypto

# If not available, install it
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Step 2: Import Database

```bash
# Import SQL file
psql -U postgres -d your_database < stc_cloud_production_clean.sql
```

The SQL file will automatically create the pgcrypto extension if it doesn't exist.

---

## 🔄 UUID Generation

If you need to generate UUIDs in your application:

### Using gen_random_uuid() (pgcrypto)

```sql
-- Generate UUID
SELECT gen_random_uuid();

-- Use in INSERT
INSERT INTO your_table (id, uuid_column) 
VALUES (1, gen_random_uuid());
```

### In Laravel Migrations

```php
// Instead of:
$table->uuid('id')->default(DB::raw('uuid_generate_v4()'));

// Use:
$table->uuid('id')->default(DB::raw('gen_random_uuid()'));
```

---

## ✅ Verification

After importing the database, verify the extension:

```sql
-- Check installed extensions
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Should return:
-- extname  | extversion | nspname
-- pgcrypto | 1.3        | public
```

---

## 📝 Notes

1. **No uuid-ossp dependency** - The schema does not require uuid-ossp extension
2. **pgcrypto is standard** - Most PostgreSQL installations include pgcrypto by default
3. **aaPanel compatible** - Works with custom PostgreSQL builds that exclude uuid-ossp
4. **UUID columns** - Current schema uses BIGSERIAL for IDs, not UUIDs

---

## 🐛 Troubleshooting

### Error: extension "pgcrypto" does not exist

**Solution:**
```bash
# Install PostgreSQL contrib package
sudo apt-get install postgresql-contrib  # Ubuntu/Debian
sudo yum install postgresql-contrib     # CentOS/RHEL

# Then create extension
sudo -u postgres psql -d your_database -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

### Error: permission denied to create extension

**Solution:**
```sql
-- Grant privileges to database user
ALTER USER your_db_user WITH SUPERUSER;
-- Or grant specific privilege:
GRANT CREATE ON DATABASE your_database TO your_db_user;
```

---

**Last Updated:** January 2, 2025  
**Version:** 2.1.0


