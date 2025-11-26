# 🏨 The Green Leaf Resort - Booking & Management System

A modern, full-stack resort booking and management platform built with Next.js, Supabase, and TypeScript.

## ✨ Features

### 🎯 Guest Features
- **Browse Accommodations** - View luxury cottages, Swiss tents, and glamping options
- **Package Booking** - Book complete resort packages
- **Real-time Availability** - Check instant availability
- **Offline Support** - Browse and book even without internet
- **Responsive Design** - Works perfectly on all devices

### 👑 Admin Features
- **Dashboard Analytics** - Real-time statistics and insights
- **Booking Management** - Handle all reservations
- **Accommodation Management** - Add/edit rooms and amenities
- **Package Management** - Create custom packages
- **Financial Tracking** - Income and expense management
- **Role-based Access** - Super Admin and Admin roles

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### 1. Install Dependencies
```bash
npm install
### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 🔐 Admin Setup

### Create Admin User

**Step 1:** In Supabase Dashboard → Authentication → Users → Add User
```
Email: admin@thegreenleafresorts.com
Password: your-secure-password
✅ Auto Confirm User
```

**Step 2:** In Supabase SQL Editor, run:
```sql
INSERT INTO admin_users (id, email, role, is_active)
SELECT id, email, 'super_admin', true
FROM auth.users
WHERE email = 'admin@thegreenleafresorts.com';
```

**Step 3:** Login at `/admin/login`

### Admin Roles

- **Super Admin** - Full access to everything
- **Admin** - Limited access based on permissions

## 📁 Project Structure

```
resort-website/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin routes
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API endpoints
│   └── ...                # Public pages
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── booking/          # Booking flow
│   └── ui/               # UI components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Helper functions
├── scripts/              # Database scripts
│   ├── ADMIN_SYSTEM_SETUP.sql  # Admin setup
│   └── test-supabase.js        # Connection test
└── public/               # Static assets
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript
- **Deployment:** Netlify / Vercel

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run supabase:test # Test database connection
```

## 🌐 Deployment

### Netlify (Recommended)

1. Connect your repository
2. Set environment variables in Netlify Dashboard
3. Deploy!

Build settings:
```
Build command: npm run build
Publish directory: .next
Node version: 20.x
```

### Environment Variables (Production)

Required in production:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
POSTGRES_URL=
NODE_ENV=production
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- API routes protected with authentication
- Role-based access control
- Secure password hashing
- HTTPS only in production

## 📊 Database Schema

Main tables:
- `accommodations` - Rooms and lodging
- `packages` - Resort packages
- `bookings` - Reservations
- `admin_users` - Admin accounts
- `profiles` - User profiles
- `income_records` - Financial tracking
- `expense_records` - Expense tracking

## 🐛 Troubleshooting

### Database Connection Issues
```bash
npm run supabase:test
```

### Permission Errors
Check RLS policies in Supabase Dashboard → Database → Policies

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📝 License

Private - The Green Leaf Resort

## 🤝 Support

For issues or questions:
- Check troubleshooting section
- Review database logs in Supabase
- Check browser console for errors

---

**Built with ❤️ for The Green Leaf Resort**
