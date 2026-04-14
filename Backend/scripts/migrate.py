import os
import asyncio
import asyncpg
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# psycopg2 (and some other libs) prefer postgresql:// instead of postgresql+asyncpg://
if DATABASE_URL and "+asyncpg" in DATABASE_URL:
    DB_URL_CLEAN = DATABASE_URL.replace("+asyncpg", "")
else:
    DB_URL_CLEAN = DATABASE_URL

async def migrate_users():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or not DATABASE_URL:
        print("Error: Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL)")
        return

    print(f"Connecting to database: {DB_URL_CLEAN.split('@')[-1]}")
    
    try:
        conn = await asyncpg.connect(DB_URL_CLEAN)
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        return

    # Fetch users from households table
    # We use username as email. 
    # NOTE: If passwords are hashed, Supabase Admin API cannot 'import' the hash as a password.
    # It will set the password to the literal hash string. Users would need to reset passwords.
    rows = await conn.fetch("SELECT username, password_hash, id FROM households")
    print(f"Found {len(rows)} users to migrate.")

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }

    for row in rows:
        username = row['username']
        legacy_id = row['id']
        
        # If the password_hash is the placeholder, skip it
        if row['password_hash'] == "SUPABASE_AUTH_MANAGED":
            print(f"Skipping {username} (already managed by Supabase)")
            continue

        # Supabase Auth requires valid email format
        email = username
        if "@" not in username:
            email = f"{username}@wellsync.local"
            print(f"  Note: Using {email} for auth (original username: {username})")

        print(f"Migrating {username} (Legacy ID: {legacy_id})...")
        
        # 1. Temporarily rename legacy username to avoid trigger collision
        temp_username = f"{username}_migrating_{legacy_id[:8]}"
        await conn.execute("UPDATE households SET username = $1 WHERE id = $2", temp_username, legacy_id)

        payload = {
            "email": email,
            "password": "Password123!", 
            "email_confirm": True,
            "user_metadata": {"migrated": True, "original_username": username}
        }

        # 2. Create user in Supabase Auth
        # This will trigger an automatic insert in public.households (the "New Record")
        response = requests.post(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers, json=payload)

        new_auth_id = None
        if response.status_code in (200, 201):
            new_auth_id = response.json().get("id")
            print(f"  SUCCESS: Auth user created. Auth ID: {new_auth_id}")
        else:
            # Revert username if failed
            print(f"  FAILED to create auth user: {response.text}")
            await conn.execute("UPDATE households SET username = $1 WHERE id = $2", username, legacy_id)
            continue

        # 3. Migrate child records (dependents, reminders, etc.) to the new record ID
        # Since the trigger set the New Record's 'id' equal to the 'auth_id'
        try:
            # List of all tables that link to household_id
            related_tables = [
                "dependents", "reminders", "health_events", "growth_records", 
                "medicine_regimens", "pregnancy_profiles", "conversations", "health_notes"
            ]
            
            for table in related_tables:
                count = await conn.execute(
                    f"UPDATE {table} SET household_id = $1 WHERE household_id = $2", 
                    new_auth_id, legacy_id
                )
                if count != "UPDATE 0":
                    print(f"    ✓ Moved records in {table}")

            # 4. Delete the legacy record
            await conn.execute("DELETE FROM households WHERE id = $1", legacy_id)
            print(f"  ✓ Legacy record {legacy_id} merged into new ID {new_auth_id}")
            
        except Exception as e:
            print(f"  ✗ Error during record merging: {e}")
            # User is created in Auth, but local merge failed. 
            # This is a bit of a mess, but auth_id is at least set.

    await conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate_users())