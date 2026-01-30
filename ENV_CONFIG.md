# Environment Configuration

## Required Environment Variables

Your `.env.local` file must be configured with the following variables for the site to work properly:

```bash
# Tourvisor API Base URL (usually don't need to change this)
NEXT_PUBLIC_API_BASE_URL=https://api.tourvisor.ru/search/api/v1

# Your Tourvisor JWT Token
# IMPORTANT: Use API_KEY (server-side only), NOT NEXT_PUBLIC_API_KEY
# This keeps your token secure and prevents exposure to the browser
API_KEY=your_jwt_token_here

# Default departure city ID
# 27 = Almaty
# 28 = Astana
NEXT_PUBLIC_DEFAULT_DEPARTURE_ID=27

# Cache TTL in minutes (how long to cache reference data like countries/cities)
NEXT_PUBLIC_CACHE_TTL_MINUTES=1440
```

## Important Security Note

**DO NOT** use `NEXT_PUBLIC_API_KEY` - this would expose your JWT token to the browser!

✅ **Correct:** `API_KEY=your_token_here` (server-side only)
❌ **Wrong:** `NEXT_PUBLIC_API_KEY=your_token_here` (exposes to browser)

## API-Only Mode

The site now runs in API-only mode, meaning:
- All tour data comes from the Tourvisor API
- Mock data in `data/tours.json` is not used
- If API is not configured or fails, empty results are returned
- Search functionality requires proper API configuration to work

## Verifying Configuration

1. Make sure your `.env.local` file exists in the project root
2. Restart the dev server after changing environment variables
3. Check the browser console and server logs for any API errors
4. Test the search form - countries and cities should load from the API
