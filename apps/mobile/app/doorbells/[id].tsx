import { useEffect, useRef, useState } from "react";
import { Alert, Share, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import type { Doorbell } from "@campainha/shared";
import { buildPublicDoorbellUrl } from "@campainha/shared";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { rotateDoorbellToken } from "@/services/doorbells";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { BrandLogo } from "@/components/BrandLogo";

export default function DoorbellQrScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doorbell, setDoorbell] = useState<Doorbell | null>(null);
  const qrRef = useRef<View>(null);

  async function load() {
    const { data, error } = await supabase.from("doorbells").select("*").eq("id", id).single();
    if (error) return Alert.alert("Erro", error.message);
    setDoorbell(data as Doorbell);
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (!doorbell) {
    return (
      <Screen dark>
        <View className="flex-1 items-center justify-center">
          <BrandLogo light />
          <Text className="mt-6 text-blue-100">Carregando campainha...</Text>
        </View>
      </Screen>
    );
  }

  const publicUrl = buildPublicDoorbellUrl(process.env.EXPO_PUBLIC_WEB_PUBLIC_URL ?? "http://localhost:5173", doorbell.qr_token);
  const doorbellId = doorbell.id;

  async function shareQr() {
    await Share.share({ message: `Campainha Digital: ${publicUrl}` });
  }

  async function downloadQr() {
    const uri = await captureRef(qrRef, { format: "png", quality: 1 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert("QR Code gerado", uri);
    }
  }

  async function rotate() {
    Alert.alert("Gerar novo QR Code?", "Ao gerar novo QR Code, o antigo deixa de funcionar.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Gerar",
        style: "destructive",
        onPress: async () => setDoorbell(await rotateDoorbellToken(doorbellId))
      }
    ]);
  }

  return (
    <Screen dark>
      <View className="gap-5">
        <BrandLogo light />

        <View>
          <Text className="text-3xl font-bold text-white">Minha Campainha</Text>
          <Text className="mt-1 text-blue-100">Compartilhe este QR Code na entrada.</Text>
        </View>

        <View className="rounded-xl bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand">
                <Ionicons name="home" size={26} color="#FFFFFF" />
              </View>
              <View>
                <Text className="font-bold text-ink">{doorbell.nome}</Text>
                <Text className="text-xs text-muted">{doorbell.local || "Sem local informado"}</Text>
              </View>
            </View>
            <Text className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-success">
              {doorbell.ativo ? "Ativa" : "Inativa"}
            </Text>
          </View>

          <View ref={qrRef} collapsable={false} className="mt-4 items-center rounded-xl bg-white p-4">
            <QRCode value={publicUrl} size={250} />
            <Text className="mt-4 text-center text-xs text-muted" numberOfLines={2}>
              {publicUrl}
            </Text>
          </View>

          <View className="rounded-lg bg-green-50 p-3">
            <Text className="text-xs font-semibold text-success">
              O QR Code contém apenas um token aleatório e não expõe dados pessoais.
            </Text>
          </View>
        </View>

        <Button title="Compartilhar" icon="share-social" onPress={shareQr} />
        <Button title="Salvar imagem" icon="image" onPress={downloadQr} variant="secondary" />
        <Button title="Gerar novo QR Code" icon="refresh" onPress={rotate} variant="danger" />
      </View>
    </Screen>
  );
}
