# Setup Guide: Supabase Integration

## Prerequisites

1. Node.js 18+ installed
2. A Supabase account (free at supabase.com)
3. A Vercel account (free at vercel.com)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: eagle (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

## Step 2: Set Up Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify tables were created in **Table Editor**

## Step 3: Set Up Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `drawings`
4. Set to **Public bucket** (or use signed URLs)
5. Click **Create bucket**

### Storage Policies (Optional but Recommended)

Go to **Storage** → **Policies** → **drawings** and add:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload drawings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'drawings');

-- Allow authenticated users to read
CREATE POLICY "Users can read drawings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'drawings');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete drawings"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'drawings');
```

## Step 4: Get API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 5: Configure Environment Variables

1. Create `.env.local` file in project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Never commit** `.env.local` to git (already in .gitignore)

## Step 6: Test Locally

1. Install dependencies:
```bash
npm install
```

2. Start dev server:
```bash
npm run dev
```

3. Open http://localhost:5173
4. Click "Sign Up" and create an account
5. Create a project and upload a drawing

## Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

## Troubleshooting

### "Supabase not configured" warning
- Check that `.env.local` exists and has correct values
- Restart dev server after adding env vars
- In Vercel, ensure env vars are set in project settings

### Authentication errors
- Check Supabase project is active
- Verify API keys are correct
- Check browser console for detailed errors

### Storage upload fails
- Verify bucket exists and is named `drawings`
- Check storage policies allow uploads
- Ensure file size is under 50MB (free tier limit)

### Database errors
- Verify schema.sql was run successfully
- Check RLS policies are enabled
- Ensure user is authenticated

## Next Steps

- ✅ Set up Supabase project
- ✅ Run database schema
- ✅ Configure storage
- ✅ Add environment variables
- ✅ Test locally
- ✅ Deploy to Vercel

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Project Issues: Check GitHub issues

