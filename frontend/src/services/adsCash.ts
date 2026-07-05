export async function getAdsStatus(): Promise<{
  adsUsedToday: number;
  maxAdsPerDay: number;
  remaining: number;
  isLimitReached: boolean;
  rewardPoints: number;
}> {
  const res = await fetch('/api/ads/status', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to load ads status');
  return data;
}

export async function rewardAd(clientNonce?: string): Promise<{
  success: boolean;
  pointsAwarded: number;
  points: number;
  balance: number;
  adsUsedToday: number;
  maxAdsPerDay: number;
  isLimitReached: boolean;
  duplicate?: boolean;
}> {
  const res = await fetch('/api/ads/reward', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clientNonce }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to reward ad');
  return data;
}

