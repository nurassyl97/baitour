# Deployment Guide

Your travel agency website is ready to deploy! Here are your deployment options:

## Option 1: Deploy to Vercel (Recommended - 5 minutes)

Vercel is the easiest way to deploy Next.js applications with zero configuration.

### Method A: Deploy via GitHub (Easiest)

1. **Push to GitHub:**
   ```bash
   # If you haven't created a GitHub repo yet:
   # 1. Go to github.com and create a new repository
   # 2. Then run:
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Done!** Your site will be live in ~2 minutes at a URL like: `https://your-project.vercel.app`

### Method B: Deploy via CLI

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## Option 2: Deploy to Netlify

1. Push your code to GitHub (see above)
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy"

## Option 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects Next.js
6. Click "Deploy"

## Post-Deployment Checklist

After deployment, update these files with your actual domain:

1. **Update sitemap URL:**
   - Edit `app/sitemap.ts`
   - Change `https://traveltours.com` to your actual domain

2. **Update robots.txt:**
   - Edit `app/robots.ts`
   - Change `https://traveltours.com` to your actual domain

3. **Add custom domain (Vercel):**
   - Go to your project in Vercel dashboard
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Follow DNS instructions

4. **Test the live site:**
   - [ ] Homepage loads correctly
   - [ ] Search functionality works
   - [ ] Tour detail pages load
   - [ ] Booking form submits successfully
   - [ ] Mobile responsive
   - [ ] Check Lighthouse score (should be 90+)

## Environment Variables

For production, you may want to add:

- `NEXT_PUBLIC_SITE_URL` - Your actual domain
- `TOURVISOR_API_KEY` - When you integrate the real API
- `FORMSPREE_ENDPOINT` - If using Formspree for forms

Add these in your Vercel/Netlify dashboard under "Environment Variables".

## Performance Monitoring

After deployment:

1. **Enable Vercel Analytics:**
   - Go to your project dashboard
   - Click "Analytics" → "Enable"
   - Free tier gives you basic metrics

2. **Test with Lighthouse:**
   ```bash
   npm install -g lighthouse
   lighthouse https://your-site.vercel.app
   ```

3. **Check Core Web Vitals:**
   - Use [PageSpeed Insights](https://pagespeed.web.dev/)
   - Target: Score above 90

## Troubleshooting

### Build fails on Vercel

- Check the build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Run `npm run build` locally to reproduce

### 404 errors

- Make sure all pages are in the `app/` directory
- Check for typos in route names
- Verify dynamic routes like `[id]` are correct

### Images not loading

- Use absolute URLs or Next.js Image component
- Check image sources in `data/tours.json`
- Verify Unsplash URLs are accessible

## Next Steps

Once deployed:

1. **Share your site** - Send the URL to stakeholders
2. **Monitor traffic** - Check Vercel Analytics
3. **Collect feedback** - Test with real users
4. **Iterate** - Based on feedback, add features from Phase 2

## Support

If you encounter issues:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Issues: Create an issue in your repo

---

🚀 **Your site is ready to launch!** Good luck with your travel agency!
