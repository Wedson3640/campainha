import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

const isExpoGo = Constants.executionEnvironment === "storeClient";

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });
}

export async function registerDeviceToken(ownerId: string) {
  if (!Device.isDevice || isExpoGo) return;

  const current = await Notifications.getPermissionsAsync();
  const finalStatus =
    current.status === "granted" ? current.status : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("doorbell", {
      name: "Campainha",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      sound: "default"
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await supabase.from("device_tokens").upsert(
    {
      owner_id: ownerId,
      expo_push_token: token,
      platform: Platform.OS,
      device_name: Device.deviceName,
      ativo: true,
      updated_at: new Date().toISOString()
    },
    { onConflict: "expo_push_token" }
  );
}

export async function playLocalDoorbellNotification(local: string | null) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Campainha Digital",
      body: `Alguém chamou${local ? ` no ${local}` : ""}.`,
      sound: "default"
    },
    trigger: null
  });
}
