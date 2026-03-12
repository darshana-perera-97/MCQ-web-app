import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Google Analytics (GA4) helpers.
 * Requires REACT_APP_GA_MEASUREMENT_ID to be set and gtag loaded from index.html.
 */

export function trackPageView(path, title) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path || window.location.pathname + window.location.search,
      page_title: title || document.title,
    });
  }
}

export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/** Renders nothing; tracks page views on route change. Place inside BrowserRouter. */
export function GoogleAnalyticsRouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);
  return null;
}
