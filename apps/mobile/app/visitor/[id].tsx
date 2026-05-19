import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import type { VisitorCall } from "@campainha/shared";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { BrandLogo } from "@/components/BrandLogo";
import { createSignedVisitorPhotoUrl, endCall } from "@/services/calls";
import { supabase } from "@/lib/supabase";

export default function VisitorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [call, setCall] = useState<VisitorCall | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from("visitor_calls").select("*, doorbells(nome, local)").eq("id", id).single();
        if (error) { Alert.alert("Erro", error.message); return; }
        const nextCall = data as VisitorCall;
        setCall(nextCall);
        if (nextCall.visitor_photo_url) {
          try {
            setPhotoUrl(await createSignedVisitorPhotoUrl(nextCall.visitor_photo_url));
          } catch { /* foto indisponível */ }
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function close() {
    await endCall(id);
    router.replace("/");
  }

  const local = call?.doorbells?.local ?? "Portão da frente";
  const nome = call?.doorbells?.nome ?? "Campainha Digital";

  if (loading) {
    return (
      <Screen dark>
        <View className="flex-1 items-center justify-center gap-4">
          <ActivityIndicator size="large" color="#93C5FD" />
          <Text className="text-blue-100">Carregando chamada…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen dark>
      <View className="gap-5">
        <BrandLogo light />

        <View className="items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full border border-blue-300 bg-brand">
            <Ionicons name="notifications" size={34} color="#FFFFFF" />
          </View>
          <Text className="mt-4 text-center text-3xl font-bold text-white">Alguém está na porta</Text>
          <Text className="mt-1 text-center text-lg font-semibold text-blue-200">{local || nome}</Text>
          <Text className="mt-1 text-center text-blue-100">Recebido agora</Text>
        </View>

        {photoUrl ? (
          <Image source={{ uri: photoUrl }} className="h-96 w-full rounded-xl bg-slate-800" resizeMode="cover" />
        ) : (
          <View className="h-80 items-center justify-center rounded-xl bg-slate-800 p-4">
            <Ionicons name="camera-outline" size={54} color="#93C5FD" />
            <Text className="mt-3 text-center text-blue-100">Visitante não autorizou câmera.</Text>
          </View>
        )}

        {call ? (
          <View className="rounded-xl bg-slate-900 p-4">
            <Text className="font-semibold text-white">Status da chamada</Text>
            <Text className="mt-1 text-blue-100">{call.status}</Text>
          </View>
        ) : null}

        <Button title="Encerrar campainha" icon="call" onPress={close} variant="danger" />
      </View>
    </Screen>
  );
}
