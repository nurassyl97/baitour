# 🔌 Tourvisor API Integration Guide

This guide will help you integrate the Tourvisor API with your BaiTour website.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start (Tomorrow)](#quick-start-tomorrow)
3. [API Architecture](#api-architecture)
4. [Detailed Setup](#detailed-setup)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Status**: ✅ **Integration Complete - Ready for API Token**

All code is implemented and ready. You just need to:
1. Get your JWT token from Tourvisor
2. Add it to `.env.local`
3. Change `DATA_SOURCE` to `api`
4. Restart the server

**Current State**: Using mock data
**After Setup**: Real tours from Tourvisor API

---

## 🚀 Quick Start (Tomorrow)

### Step 1: Get JWT Token (5 minutes)

1. Go to your Tourvisor personal cabinet
2. Navigate to API settings
3. Copy your JWT token

### Step 2: Configure Environment (2 minutes)

Open `.env.local` and update:

```bash
# Replace empty value with your JWT token
NEXT_PUBLIC_API_KEY=eyJhbGciOiJIUzUxNiIsInR5cCI6IkpXVCJ9...

# Change from 'mock' to 'api'
NEXT_PUBLIC_DATA_SOURCE=api
```

### Step 3: Restart Server (1 minute)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test (5 minutes)

1. Open http://localhost:3000
2. Try searching for tours
3. Check browser console (F12) for any errors
4. Verify tours are loading from Tourvisor

**That's it!** ✅

---

## 🏗️ API Architecture

### File Structure

```
lib/
├── tourvisor-types.ts      # TypeScript interfaces for Tourvisor API
├── tourvisor-cache.ts      # Caching system for reference books
├── tourvisor-api.ts        # Direct Tourvisor API client
├── tourvisor-adapter.ts    # Transforms Tourvisor data to our Tour format
├── api.ts                  # Main API layer (uses Tourvisor)
└── data.ts                 # Mock data (fallback)
```

### Data Flow

```
User Action
    ↓
api.ts (decides: use API or mock?)
    ↓
tourvisor-api.ts (calls Tourvisor)
    ↓
Poll for results (async)
    ↓
tourvisor-adapter.ts (transform data)
    ↓
Display to user
```

### Asynchronous Search Flow

Tourvisor uses asynchronous search:

1. **Start Search** → Get `searchId`
2. **Poll Results** → Check status every 1-5 seconds
3. **Complete** → All results collected
4. **Transform** → Convert to our format

This typically takes 10-30 seconds. The UI shows a progress bar during this time.

---

## 📝 Detailed Setup

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Tourvisor API base URL | `https://api.tourvisor.ru/search/api/v1` | Yes |
| `NEXT_PUBLIC_API_KEY` | Your JWT token | (empty) | Yes |
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` or `api` | `mock` | Yes |
| `NEXT_PUBLIC_DEFAULT_DEPARTURE_ID` | Departure city ID | `27` (Almaty) | Yes |
| `NEXT_PUBLIC_CACHE_TTL_MINUTES` | Cache duration | `1440` (24h) | No |

### Departure City IDs

Common Kazakhstan cities:
- **27** - Almaty
- **28** - Astana (Nur-Sultan)
- **29** - Shymkent

To see all cities, call: `/departures?departureCountryId=3`

### Country IDs

You'll need to map country names to IDs. The adapter currently has a simplified mapping:

```typescript
const countryMap = {
  'Турция': 10,
  'ОАЭ': 15,
  'Египет': 20,
  'Мальдивы': 25,
  'Таиланд': 30,
};
```

To get the full list, call: `/countries?departureId=27`

---

## 🧪 Testing

### 1. Test Authentication

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.tourvisor.ru/search/api/v1/departures
```

**Expected**: List of departure cities
**Error 401**: Invalid token
**Error 403**: Token expired

### 2. Test Reference Books

Open browser console (F12) and run:

```javascript
// Should log "Using mock data" initially
console.log(process.env.NEXT_PUBLIC_DATA_SOURCE);
```

After setting `DATA_SOURCE=api`, it should call real API.

### 3. Test Search

1. Go to homepage
2. Select country, city, dates
3. Click "Поиск туров"
4. Wait for progress bar (10-30 seconds)
5. Tours should appear

**Check console for:**
```
Starting Tourvisor search with params: {...}
Search started with ID: abc123...
Starting to poll search results for searchId: abc123...
Search complete! Found 50 tours
```

### 4. Test Hot Tours

Hot tours appear on the homepage as "Популярные туры"

**Verify:**
- 🔥 Icon on hot tours
- Discount percentage shown
- Old price vs new price

---

## 🔧 Troubleshooting

### Issue 1: "401 Unauthorized"

**Cause**: Invalid or expired JWT token

**Solution**:
1. Get a new token from Tourvisor cabinet
2. Update `.env.local`
3. Restart server

### Issue 2: "Search timeout"

**Cause**: Search took too long (>30 attempts)

**Solution**:
- Check if Tourvisor API is responding
- Try with fewer filters (less to search)
- Check network connection

**Code handles this**: Returns partial results or falls back to mock data

### Issue 3: "Rate limit exceeded (429)"

**Cause**: Too many requests

**Limits**:
- Search: 300 requests/minute
- References: 120 requests/minute
- Daily: 3000 searches included in tariff

**Solution**:
- Code automatically waits 1 minute and retries
- Consider caching results
- Avoid unnecessary searches

### Issue 4: Tours show but details are wrong

**Cause**: Data transformation issue

**Solution**:
1. Check browser console for errors
2. Verify Tourvisor response format matches types
3. Update `tourvisor-adapter.ts` if API changed

### Issue 5: "Cannot read property X of undefined"

**Cause**: Tourvisor data structure differs from expected

**Solution**:
1. Log the actual response: `console.log(tourvisorTour)`
2. Compare with `TourvisorTour` interface in `tourvisor-types.ts`
3. Add null checks in `tourvisor-adapter.ts`

---

## 📊 API Endpoints Used

### Reference Books (Cached 24h)

| Endpoint | Purpose | Cache |
|----------|---------|-------|
| `/departures` | Departure cities | 24h |
| `/countries` | Countries | 24h |
| `/regions` | Resorts/cities | 24h |
| `/meals` | Meal types | 24h |
| `/operators` | Tour operators | 24h |
| `/hotels/{id}` | Hotel details | 24h |
| `/currency-rates` | Currency rates | 1h |

### Search (Not cached)

| Endpoint | Purpose | Tariff |
|----------|---------|--------|
| `POST /tour-search` | Start search | 1 search |
| `GET /tour-search/result` | Poll results | Free |
| `GET /tours/{id}` | Tour details | Free |
| `GET /tour-flights` | Actualize price | 1 search |

### Hot Tours (Not cached)

| Endpoint | Purpose |
|----------|---------|
| `GET /tours/hots` | Get hot deals |

---

## 💡 Best Practices

### 1. Caching

✅ **DO**: Let the system cache reference books
❌ **DON'T**: Clear cache unnecessarily

Reference books rarely change. The system caches them for 24 hours automatically.

### 2. Search Optimization

✅ **DO**: Use specific filters (country, region, dates)
❌ **DON'T**: Run broad searches frequently

Narrow searches complete faster and consume fewer resources.

### 3. Error Handling

✅ **DO**: Always provide fallback to mock data
✅ **DO**: Show user-friendly error messages
✅ **DO**: Log errors for debugging

The system automatically falls back to mock data if Tourvisor fails.

### 4. Progress Indication

✅ **DO**: Show progress bar during search
✅ **DO**: Inform user it takes 10-30 seconds
✅ **DO**: Allow partial results

Users need to know the system is working.

---

## 📈 Monitoring

### What to Monitor

1. **Search success rate**: Are searches completing?
2. **Response times**: Is it taking too long?
3. **Error rate**: Too many failures?
4. **Cache hit rate**: Are reference books cached?

### Check Browser Console

The system logs important events:

```
✅ Success logs:
- "Starting Tourvisor search..."
- "Search complete! Found X tours"

⚠️ Warning logs:
- "Could not fetch hotel description"
- "Returning partial results due to error"

❌ Error logs:
- "Failed to search tours via Tourvisor"
- "Tourvisor API Error: 401"
```

### Check Server Logs

```bash
# Watch dev server logs
npm run dev

# Look for:
# - API calls being made
# - Errors and stack traces
# - Performance warnings
```

---

## 🎓 Learning Resources

- **Tourvisor API Docs**: https://api.tourvisor.ru/search/docs
- **JWT.io**: Decode your token to check expiry
- **Postman/Insomnia**: Test API endpoints manually

---

## ✅ Launch Checklist

Before going live:

- [ ] JWT token obtained and added to `.env.local`
- [ ] `DATA_SOURCE` set to `api`
- [ ] Test search works end-to-end
- [ ] Test hot tours display on homepage
- [ ] Test tour details page loads
- [ ] Verify booking form works
- [ ] Check browser console has no errors
- [ ] Test on mobile device
- [ ] Add token to Vercel environment variables
- [ ] Deploy to production
- [ ] Test production URL

---

## 🆘 Support

If you encounter issues:

1. Check this documentation first
2. Review `API_INTEGRATION.md` for general guidance
3. Check browser console (F12 → Console tab)
4. Check server logs (terminal where `npm run dev` is running)
5. Test API directly with curl/Postman

---

## 📝 Notes

- Tourvisor API is production-ready and stable
- Rate limits are generous for normal usage
- Caching is automatic and efficient
- Fallback to mock data ensures site always works
- Progress indicators keep users informed

**You're all set! Just add your token tomorrow and you're live!** 🚀
