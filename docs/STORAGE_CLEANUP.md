# Storage Cleanup Strategy

## Current Implementation ✅

Files are automatically deleted from storage when:

1. **User removes upload** - `useFileUpload.removeUpload()` calls `/api/uploads/delete`
2. **User clears all uploads** - `useFileUpload.clearAll()` deletes all completed uploads

## Remaining Issue ⚠️

**Orphaned files still occur when:**

- User closes browser/tab before submitting (abandons submission)
- Browser crashes during upload flow
- User navigates away without removing files

These files remain in storage indefinitely since they're never referenced in the database.

---

## Solution: Background Cleanup Job

### Implementation Options

#### Option 1: Supabase Edge Function (Recommended)

Create a scheduled Edge Function that runs daily:

```sql
-- Query to find orphaned files
SELECT storage_path FROM tracks
WHERE created_at < NOW() - INTERVAL '24 hours';

-- Then delete files in storage bucket that aren't in this list
```

**Pros:**

- Native to Supabase
- No external infrastructure
- Built-in cron scheduling

**Cons:**

- Need to enable Edge Functions

#### Option 2: Next.js API Route + External Cron

Create `/api/admin/cleanup-storage` and call via external cron (e.g., Vercel Cron, GitHub Actions)

**Pros:**

- Simple to implement
- Uses existing tech stack

**Cons:**

- Requires external scheduler
- API route must be protected

---

## Recommended Implementation

### Step 1: Create Cleanup API Route

```typescript
// app/api/admin/cleanup-storage/route.ts
import { createAdminClient } from "@/lib/supabase/server";
import { ok, errors } from "@/lib/api";

export async function POST(request: NextRequest) {
  // 1. Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errors.unauthorized();
  }

  const adminClient = createAdminClient();

  // 2. Get all files in storage
  const { data: files } = await adminClient.storage
    .from("tracks")
    .list("submissions");

  // 3. Get all storage paths from DB
  const { data: tracks } = await adminClient
    .from("tracks")
    .select("storage_path");

  const dbPaths = new Set(tracks?.map((t) => t.storage_path) || []);

  // 4. Find orphaned files (in storage but not in DB)
  const orphaned =
    files?.filter((file) => {
      const fullPath = `submissions/${file.name}`;
      return !dbPaths.has(fullPath);
    }) || [];

  // 5. Delete orphaned files older than 24 hours
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const toDelete = orphaned
    .filter((file) => new Date(file.created_at).getTime() < cutoff)
    .map((file) => `submissions/${file.name}`);

  if (toDelete.length > 0) {
    await adminClient.storage.from("tracks").remove(toDelete);
  }

  return ok({ deletedCount: toDelete.length, orphanedFiles: orphaned.length });
}
```

### Step 2: Setup Vercel Cron Job

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-storage",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Step 3: Add Environment Variable

```bash
# .env.local
CRON_SECRET=your-secret-token-here
```

---

## Timeline

- **Immediate** ✅: Delete on remove/clear (implemented)
- **Within 1 week**: Implement background cleanup job
- **Monitor**: Track orphaned file metrics

---

## Cost Estimate

Without cleanup:

- ~10 abandoned submissions/day × 3 files × 20MB = 600MB/day
- 18GB/month in orphaned files

With cleanup:

- Maximum 24 hours of orphaned files
- ~600MB max at any time

**Savings**: ~17.4GB/month
