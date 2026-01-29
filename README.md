# TravelTours - Travel Agency Website

A modern, SEO-friendly travel agency website built with Next.js 14, featuring tour search, detailed tour pages, and a booking request system.

## Features

- 🔍 **Advanced Search** - Search tours by country, city, dates, and number of travelers
- 🏨 **Tour Details** - Comprehensive tour pages with images, itineraries, and hotel information
- 💳 **Booking System** - Easy-to-use booking request form with confirmation
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- ⚡ **Fast Performance** - Optimized with Next.js 14 and static generation
- 🎯 **SEO Optimized** - Structured data, sitemap, and metadata for better search visibility
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tours
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── search/            # Search results page
│   ├── tour/[id]/         # Dynamic tour detail pages
│   ├── booking/           # Booking form page
│   ├── confirmation/      # Booking confirmation page
│   ├── layout.tsx         # Root layout with nav/footer
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # Robots.txt configuration
├── components/            # React components
│   ├── search-form.tsx    # Search form component
│   ├── tour-card.tsx      # Tour card component
│   └── ui/               # shadcn/ui components
├── lib/
│   └── data.ts           # Data fetching and filtering functions
├── data/
│   └── tours.json        # Mock tour data (20 tours)
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will automatically detect Next.js and deploy

The site will be live in minutes!

### Deploy to Other Platforms

This is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Any platform supporting Node.js

## Customization

### Update Tour Data

Edit `data/tours.json` to add, remove, or modify tours. Each tour includes:
- Basic info (name, location, duration, price)
- Images and descriptions
- Highlights and itinerary
- Hotel information
- Included/excluded items

### Integrate Real API

Replace the mock data in `lib/data.ts` with actual API calls to Tourvisor or your backend.

### Add Payment Processing

For MVP, bookings are request-based. To add payments:
1. Integrate Stripe or PayPal
2. Add payment page after booking form
3. Store completed bookings in database

### Customize Design

- Colors: Edit `app/globals.css` for theme colors
- Components: Modify `components/` files
- Layout: Update `app/layout.tsx`

## SEO Features

- ✅ Dynamic sitemap generation
- ✅ Robots.txt configuration
- ✅ Structured data (Schema.org) for tours
- ✅ OpenGraph images for social sharing
- ✅ Optimized metadata for all pages
- ✅ Static generation for fast loading

## Future Enhancements

- [ ] User authentication and accounts
- [ ] Real Tourvisor API integration
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Reviews and ratings system
- [ ] Wishlist functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this for your projects!

## Contact

For questions or support, contact: info@traveltours.com

---

Built with ❤️ using Next.js and TypeScript
