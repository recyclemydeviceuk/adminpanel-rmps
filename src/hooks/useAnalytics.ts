import { useState, useEffect } from 'react';
import type { AnalyticsData } from '../types/analytics';
import { getAnalyticsData } from '../lib/analytics';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAnalyticsData()
      .then(setData)
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
