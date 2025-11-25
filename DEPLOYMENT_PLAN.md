# Deployment Plan: Eagle → Vercel + Supabase

## Recommended Stack

### Why Supabase?
✅ **Built-in Authentication** - Email/password, OAuth, magic links  
✅ **PostgreSQL Database** - Relational, ACID compliant, SQL  
✅ **File Storage** - Built-in S3-compatible storage for PDFs  
✅ **Real-time** - Optional real-time subscriptions  
✅ **Free Tier** - Generous limits for MVP  
✅ **Vercel Integration** - Works seamlessly with Vercel  

### Alternative Options
- **Vercel Postgres + Clerk** - More setup, but more control
- **Firebase** - NoSQL, different paradigm
- **PlanetScale** - MySQL, good but no built-in auth

## Architecture Overview

```
Frontend (React + Vite)
    ↓
Supabase Client (Browser)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   Supabase      │   Supabase      │   Supabase      │
│   Auth          │   Database      │   Storage       │
└─────────────────┴─────────────────┴─────────────────┘
```

## Database Schema

### Tables Needed:

1. **projects**
   - id (uuid, primary key)
   - name (text)
   - description (text)
   - status (enum: active, completed, on-hold)
   - created_at (timestamp)
   - owner_id (uuid, foreign key → auth.users)
   - notes (text)

2. **drawings**
   - id (uuid, primary key)
   - project_id (uuid, foreign key → projects)
   - name (text)
   - file_url (text, Supabase Storage URL)
   - num_pages (integer)
   - uploaded_at (timestamp)
   - uploaded_by (uuid, foreign key → auth.users)

3. **issues**
   - id (uuid, primary key)
   - drawing_id (uuid, foreign key → drawings)
   - project_id (uuid, foreign key → projects)
   - page_number (integer)
   - x (float, 0-1 relative position)
   - y (float, 0-1 relative position)
   - type (text)
   - severity (enum: Low, Medium, High)
   - description (text)
   - status (enum: Open, In Review, Resolved)
   - created_by (uuid, foreign key → auth.users)
   - ai_generated (boolean)
   - created_at (timestamp)

4. **project_members**
   - id (uuid, primary key)
   - project_id (uuid, foreign key → projects)
   - user_id (uuid, foreign key → auth.users)
   - role (enum: junior, senior)
   - joined_at (timestamp)
   - Unique constraint: (project_id, user_id)

## Implementation Steps

### Phase 1: Setup (Day 1)
1. Create Supabase project
2. Set up database schema
3. Configure authentication
4. Set up storage bucket for PDFs

### Phase 2: Frontend Integration (Day 2-3)
1. Install Supabase client
2. Replace mock auth with Supabase auth
3. Create API service layer
4. Update components to use real data

### Phase 3: File Upload (Day 3-4)
1. Implement PDF upload to Supabase Storage
2. Update drawing creation flow
3. Handle file URLs

### Phase 4: AI Integration (Day 4-5)
- **Option A (MVP)**: Generate fake issues based on drawing
- **Option B (Future)**: Integrate OpenAI Vision API or Claude

### Phase 5: Deploy (Day 5)
1. Configure Vercel project
2. Set environment variables
3. Deploy and test

## Cost Estimate

### Supabase Free Tier:
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- Unlimited API requests

### Vercel Free Tier:
- Unlimited deployments
- 100GB bandwidth
- Serverless functions

**Total: $0/month for MVP** 🎉

## Next Steps

See `IMPLEMENTATION_GUIDE.md` for detailed code examples.

