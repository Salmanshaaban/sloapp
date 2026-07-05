/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_UNITY_GAME_ID?: string;
  readonly VITE_UNITY_ADS_ENABLED?: string;
  readonly VITE_UNITY_ADS_TEST_MODE?: string;
  readonly VITE_UNITY_REWARDED_VIDEO_PLACEMENT_ID?: string;
  readonly VITE_UNITY_INTERSTITIAL_PLACEMENT_ID?: string;
  readonly VITE_UNITY_BANNER_PLACEMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
