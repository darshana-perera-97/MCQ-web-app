# Google Analytics (GA4) Setup Instructions

This project is set up to use Google Analytics 4. Follow these steps to enable it.

---

## 1. Create a Google Analytics 4 property (if you don’t have one)

1. Go to [Google Analytics](https://analytics.google.com/) and sign in.
2. Click **Admin** (gear icon) in the bottom-left.
3. Under **Property**, click **Create property**.
4. Enter a property name (e.g. “MCQ Web App”) and choose time zone and currency.
5. Click **Next** and complete the business details (or skip).
6. Under **Data collection**, choose **Web**.
7. Enter your website URL (e.g. `https://gov-exam.nexgenai.asia`) and a stream name.
8. Click **Create stream**.
9. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`). You will use this in the next step.

---

## 2. Add your Measurement ID to the app

1. In the **frontend** folder, copy the example env file (if you don’t already have a `.env`):
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`)

2. Open **`.env`** and add or edit this line (use your real Measurement ID):
   ```env
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. Save the file. **Do not commit `.env`**; it should stay in `.gitignore`.

---

## 3. Restart the app

- **Development:** Stop the dev server (Ctrl+C) and run `npm start` again.
- **Production:** Run a new build (`npm run build`) and deploy the new build.

Environment variables are read at build/start time, so a restart is required after changing `.env`.

---

## 4. Verify it’s working

1. Open your site in a browser.
2. In Google Analytics, go to **Reports → Realtime**.
3. You should see at least one user (you) and the page they’re on.
4. Navigate to a few different routes; each route change should show up as a new page view in Realtime.

---

## What is tracked automatically

- **Page views** – Initial load and every route change (e.g. `/`, `/quiz`, `/student/dashboard`) are sent as `page_view` events.

---

## Optional: Track custom events

To track actions like “quiz started” or “quiz completed”, use the analytics helper:

```javascript
import { trackEvent } from './utils/analytics';

// Example: when a quiz is submitted
trackEvent('quiz_completed', {
  quiz_id: 'daily-quiz',
  score: 85,
});
```

Events will appear in GA4 under **Reports → Engagement → Events** (and in Realtime).

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| No data in GA4 | Ensure `REACT_APP_GA_MEASUREMENT_ID` is set in `.env` and you restarted the dev server or rebuilt. |
| Wrong Measurement ID | In `.env`, the value must be exactly your GA4 Measurement ID (e.g. `G-XXXXXXXXXX`), with no spaces or quotes. |
| Blockers / ad blockers | Disable browser extensions that block analytics when testing; they can block gtag. |

---

## Files involved

- **`public/index.html`** – Loads the GA4 gtag script and only initializes when `REACT_APP_GA_MEASUREMENT_ID` is set.
- **`src/utils/analytics.js`** – `trackPageView`, `trackEvent`, and `GoogleAnalyticsRouteTracker` for route-based page views.
- **`src/App.js`** – Renders `GoogleAnalyticsRouteTracker` inside the router so each route change is tracked.
- **`.env`** – Your local file where you set `REACT_APP_GA_MEASUREMENT_ID` (see `.env.example` for a template).
