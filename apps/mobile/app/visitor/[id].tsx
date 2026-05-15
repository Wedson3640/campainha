import { useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import type { VisitorCall } from "@campainha/shared";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { createSignedVisitorPhotoUrl, endCall } from "@/services/calls";
import { supabase } from "@/lib/supabase";

export default function VisitorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [call, setCall] = useState<VisitorCall | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("visitor_calls").select("*, doorbells(nome, local)").eq("id", id).single();
      if (error) return Alert.alert("Erro", error.message);
      const nextCall = data as VisitorCall;
      setCall(nextCall);
      if (nextCall.visitor_photo_url) {
        setPhotoUrl(await createSignedVisitorPhotoUrl(nextCall.visitor_photo_url));
      }
    }
    void load();
  }, [id]);

  async function close() {
    await endCall(id);
    router.replace("/");
  }

  return (
    <Screen>
      <View className="gap-5">
        <Text className="text-3xl font-bold text-ink">Ver visitante</Text>
        <Text className="text-muted">
          As imagens dos visitantes devem ser usadas apenas para identificação da chamada e segurança residencial.
        </Text>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} className="h-96 w-full rounded-xl bg-slate-200" resizeMode="cover" />
        ) : (
          <View className="h-64 items-center justify-center rounded-xl bg-white p-4">
            <Text className="text-center text-muted">Visitante não autorizou câmera.</Text>
          </View>
        )}
        {call ? <Text className="text-sm text-muted">Status: {call.status}</Text> : null}
        <Button title="Encerrar chamada" onPress={close} variant="danger" />
      </View>
    </Screen>
  );
}
