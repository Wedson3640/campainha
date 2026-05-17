import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useDoorbellRealtime } from "@/hooks/useDoorbellRealtime";
import { CallModal } from "@/components/CallModal";

const isExpoGo = Constants.executionEnvironment === "storeClient";

function RootNavigator() {
  const { user, loading } = useAuth();
  const { activeCall, setActiveCall } = useDoorbellRealtime(user?.id);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user]);

  // Quando o morador toca na notificação push com app fechado/background
  useEffect(() => {
    if (isExpoGo) return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const callId = response.notification.request.content.data?.callId as string | undefined;
      if (callId) router.push({ pathname: "/visitor/[id]", params: { id: callId } });
    });
    return () => sub.remove();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <CallModal
        call={activeCall}
        onClose={() => setActiveCall(null)}
        onView={(call) => {
          setActiveCall(null);
          router.push({ pathname: "/visitor/[id]", params: { id: call.id } });
        }}
      />
    </>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
