import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useDoorbellRealtime } from "@/hooks/useDoorbellRealtime";
import { CallModal } from "@/components/CallModal";

function RootNavigator() {
  const { user, loading } = useAuth();
  const { activeCall, setActiveCall } = useDoorbellRealtime(user?.id);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user]);

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
