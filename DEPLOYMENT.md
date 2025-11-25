# 🚀 Deployment Guide

## Prerequisites Checklist

- [ ] Node.js 20+ installed
- [ ] Supabase project created
- [ ] Environment variables ready
- [ ] Admin user created
- [ ] Database migrated

---

## 📋 Deployment Steps

### 1. Database Setup (One-time)

**A. Run Migrations**
```sql
-- In Supabase SQL Editor, run:
scripts/ADMIN_SYSTEM_SETUP.sql
```

**B. Create Admin User**
1. Supabase Dashboard → Authentication → Users → Add User
2. Email: `your-admin@email.com`
3. Password: Strong password
4. ✅ Auto Confirm User

**C. Promote to Admin**
```sql
INSERT INTO admin_users (id, email, role, is_active)
SELECT id, email, 'super_admin', true
FROM auth.users
WHERE email = 'your-admin@email.com';
```

---

### 2. Configure Supabase

**Authentication Settings:**
- Dashboard → Authentication → Settings
- Site URL: `https://your-domain.com`
- Redirect URLs: Add your domain
- Email templates: Customize (optional)

**Database:**
- Verify all tables exist
- Check RLS policies are enabled
- Ensure backups are configured

---

### 3. Environment Variables

Set these in your hosting platform:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
POSTGRES_URL=postgresql://...

# Optional
NODE_ENV=production
```

---

### 4. Deploy to Netlify

**Via Dashboard:**
1. Connect Git repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `20`
3. Add environment variables
4. Deploy!

**Via CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

### 5. Deploy to Vercel

**Via Dashboard:**
1. Import project from Git
2. Framework: Next.js (auto-detected)
3. Add environment variables
4. Deploy!

**Via CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## ✅ Post-Deployment

### Test Checklist

- [ ] Homepage loads
- [ ] Accommodations display
- [ ] Packages display
- [ ] Booking flow works
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] No console errors

### Security Checklist

- [ ] HTTPS enabled
- [ ] RLS policies active
- [ ] Admin passwords changed from defaults
- [ ] CORS configured properly
- [ ] API routes authenticated

---

## 🐛 Common Issues

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Errors

```bash
# Test connection
npm run supabase:test
```

Check:
- Environment variables are correct
- Supabase project is not paused
- Connection string is valid

### Admin Can't Login

```sql
-- Verify admin exists
SELECT * FROM admin_users WHERE email = 'your-email@domain.com';

-- Check if active
SELECT is_active FROM admin_users WHERE email = 'your-email@domain.com';
```

---

## 📊 Monitoring

**Check Logs:**
- Netlify: Dashboard → Logs
- Vercel: Dashboard → Deployments → Function Logs
- Supabase: Dashboard → Database → Logs

**Performance:**
- Check build times
- Monitor database queries
- Watch for 500 errors

---

## 🔄 Updates

**To deploy updates:**
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Auto-deploys if connected to Git!

---

## 📞 Support

**If something breaks:**
1. Check deployment logs
2. Check Supabase logs
3. Check browser console
4. Review environment variables

---

**Need Help?**
- Check README.md
- Review database schema
- Test with `npm run supabase:test`

---

**🎉 Your resort booking system is live!**
