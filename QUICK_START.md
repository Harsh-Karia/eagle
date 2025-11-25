# Quick Start: Deploying to Production

## TL;DR - Recommended Approach

**Use Supabase + Vercel** - It's the fastest path to production with minimal setup.

## Why This Stack?

1. **Supabase** = Database + Auth + Storage in one
2. **Vercel** = Zero-config deployment
3. **Free tier** = $0/month for MVP
4. **Real-time** = Built-in if you need it later

## Estimated Timeline

- **Setup**: 2-3 hours
- **Integration**: 1-2 days
- **Testing**: 1 day
- **Deploy**: 30 minutes

**Total: ~3-4 days to production**

## Step-by-Step Checklist

### Day 1: Setup
- [ ] Create Supabase account (supabase.com)
- [ ] Create new project
- [ ] Run database schema SQL (from IMPLEMENTATION_GUIDE.md)
- [ ] Create storage bucket named "drawings"
- [ ] Get API keys

### Day 2: Integration
- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Create `lib/supabase.ts` with client
- [ ] Create `lib/auth.ts` for authentication
- [ ] Create `lib/api.ts` for database operations
- [ ] Update `App.tsx` to use real auth
- [ ] Update components to fetch from Supabase

### Day 3: File Upload
- [ ] Implement PDF upload to Supabase Storage
- [ ] Update drawing creation flow
- [ ] Test file upload/download

### Day 4: Deploy
- [ ] Push code to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables
- [ ] Deploy and test

## AI Integration Options

### Option 1: Fake Issues (MVP - Recommended)
- Generate realistic fake issues based on drawing metadata
- Fast to implement
- Good enough for demo/MVP
- Can upgrade later

### Option 2: OpenAI Vision API
- Convert PDF pages to images
- Send to GPT-4 Vision
- Parse response for issues
- Cost: ~$0.01-0.03 per drawing
- More accurate but slower

### Option 3: Custom VLLM
- Train/fine-tune model on engineering drawings
- Requires ML expertise
- Best long-term but complex

**Recommendation**: Start with Option 1, add Option 2 later if needed.

## Cost Breakdown

### Supabase Free Tier:
- ✅ 500MB database (enough for ~10,000 projects)
- ✅ 1GB storage (enough for ~500 PDFs)
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions

**Total: $0/month** until you scale beyond free tier limits.

## Common Questions

**Q: Can I use a different database?**  
A: Yes, but Supabase is easiest. Alternatives: Vercel Postgres + Clerk, Firebase, PlanetScale.

**Q: Do I need a backend?**  
A: No! Supabase handles everything. You can add Vercel serverless functions later if needed.

**Q: What about PDF parsing?**  
A: Use pdf.js (already in your project) client-side, or parse server-side with a function.

**Q: How do I handle large PDFs?**  
A: Supabase Storage handles up to 50MB per file on free tier. For larger files, use chunked uploads.

## Getting Help

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Discord: https://discord.supabase.com

## Next Steps

1. Read `DEPLOYMENT_PLAN.md` for architecture details
2. Read `IMPLEMENTATION_GUIDE.md` for code examples
3. Start with Supabase setup
4. Follow the checklist above

Good luck! 🚀

