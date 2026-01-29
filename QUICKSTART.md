# Quick Start Guide

Get your travel agency website running in 3 minutes!

## Prerequisites
- Node.js 18+ installed
- Git installed

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

## Step 2: Run Development Server (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 3: Explore the Site

### Available Pages:
- **Homepage:** http://localhost:3000
- **Search Results:** http://localhost:3000/search?country=Turkey
- **Tour Detail:** http://localhost:3000/tour/1
- **Booking Form:** http://localhost:3000/booking?tourId=1

### Test the Full Flow:
1. Go to homepage
2. Use search form (select Turkey → Istanbul)
3. Click on a tour card
4. Click "Book Now" button
5. Fill out booking form
6. Submit and see confirmation

## Deploy to Production (5 minutes)

### Option A: Deploy with Vercel (Easiest)

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repo
   - Click "Deploy"
   - Done! 🎉

### Option B: Deploy with CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check for errors
```

## File Structure Overview

```
/app             # All pages (Next.js App Router)
/components      # Reusable React components
/data           # tours.json with 20 sample tours
/lib            # Helper functions
/public         # Static assets
```

## Customization Quick Wins

### 1. Update Site Name (30 seconds)
Edit `app/layout.tsx`:
```typescript
<Link href="/" className="text-2xl font-bold">
  YourCompanyName  // Change this
</Link>
```

### 2. Change Color Scheme (2 minutes)
Edit `app/globals.css` - change these CSS variables:
```css
--primary: YOUR_COLOR;
--secondary: YOUR_COLOR;
```

### 3. Add Your Tours (5 minutes)
Edit `data/tours.json` - copy an existing tour and modify:
- Change name, city, country
- Update price and duration
- Add your images (use Unsplash URLs)
- Customize highlights

### 4. Update Contact Info (1 minute)
Edit `app/layout.tsx` footer section:
```typescript
<li>Email: your@email.com</li>
<li>Phone: your-phone</li>
```

## Need Help?

- **Full Documentation:** See `README.md`
- **Deployment Guide:** See `DEPLOYMENT.md`
- **Complete Overview:** See `PROJECT_SUMMARY.md`

## Production Checklist

Before going live:
- [ ] Update site name and branding
- [ ] Replace sample tours with real data
- [ ] Update contact information
- [ ] Add your domain to Vercel
- [ ] Update sitemap.ts with your domain
- [ ] Test booking form
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit (aim for 90+)

## Troubleshooting

### Build fails?
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

### Types errors?
```bash
npm install
npm run build
```

## What's Next?

1. **Go Live** - Deploy to Vercel
2. **Share** - Send URL to stakeholders
3. **Monitor** - Check Vercel Analytics
4. **Iterate** - Add features based on feedback

---

**That's it!** You now have a production-ready travel agency website.

Questions? Check the other documentation files in this project.

Happy building! 🚀
