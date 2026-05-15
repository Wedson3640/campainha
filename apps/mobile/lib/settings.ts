import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppSettings } from "@campainha/shared";

const SETTINGS_KEY = "campainha:settings";

export const defaultSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  silentMode: false
};

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  return { ...defaultSettings, ...JSON.parse(raw) };
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
