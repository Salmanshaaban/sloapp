type OfferwallKey = 'surveys' | 'appInstalls' | 'games';

const readEnv = (key: string, fallback = ''): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  return typeof value === 'string' ? value.trim() : fallback;
};

type UnityAdsWindow = Window & {
  UnityAds?: {
    isReady?: (placementId: string) => boolean;
    show?: (placementId: string, options?: { gameId?: string }) => void;
  };
};

export const unityAdsConfig = {
  gameId: readEnv('VITE_UNITY_GAME_ID', '800078443'),
  enabled: readEnv('VITE_UNITY_ADS_ENABLED', 'true').toLowerCase() === 'true' || readEnv('VITE_UNITY_ADS_ENABLED', 'true') === '1',
  placementId: readEnv('VITE_UNITY_REWARDED_VIDEO_PLACEMENT_ID', 'rewardedVideo'),
};

export const offerwallConfigs: Record<OfferwallKey, { label: string; filter: string; url: string }> = {
  surveys: {
    label: 'Surveys',
    filter: readEnv('VITE_AYET_SURVEY_FILTER', 'surveys'),
    url: readEnv('VITE_AYET_OFFERWALL_URL', 'https://offerwall.ayetstudios.com'),
  },
  appInstalls: {
    label: 'App Installs',
    filter: readEnv('VITE_AYET_APP_INSTALL_FILTER', 'app-installs'),
    url: readEnv('VITE_AYET_OFFERWALL_URL', 'https://offerwall.ayetstudios.com'),
  },
  games: {
    label: 'Games',
    filter: readEnv('VITE_AYET_GAME_FILTER', 'games'),
    url: readEnv('VITE_AYET_OFFERWALL_URL', 'https://offerwall.ayetstudios.com'),
  },
};

export const openUnityRewardedVideo = () => {
  if (!unityAdsConfig.enabled || !unityAdsConfig.gameId) {
    window.open('https://unity.com/products/ads', '_blank', 'noopener,noreferrer');
    return;
  }

  const unityWindow = window as UnityAdsWindow;
  if (unityWindow.UnityAds?.isReady?.(unityAdsConfig.placementId)) {
    unityWindow.UnityAds.show?.(unityAdsConfig.placementId, { gameId: unityAdsConfig.gameId });
    return;
  }

  const fallbackUrl = `https://unity.com/products/ads?gameId=${encodeURIComponent(unityAdsConfig.gameId)}&placement=${encodeURIComponent(unityAdsConfig.placementId)}`;
  window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
};

export const openOfferwall = (key: OfferwallKey) => {
  const config = offerwallConfigs[key];
  const target = new URL(config.url);
  target.searchParams.set('source', 'salo');
  target.searchParams.set('filter', config.filter);
  target.searchParams.set('section', key);
  window.open(target.toString(), '_blank', 'noopener,noreferrer');
};
