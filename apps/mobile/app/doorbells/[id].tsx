import { useEffect, useRef, useState } from "react";
import { Alert, Share, Text, View } from "react-native";
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
      <Screen>
        <Text className="text-muted">Carregando...</Text>
      </Screen>
    );
  }

  const publicUrl = buildPublicDoorbellUrl(process.env.EXPO_PUBLIC_WEB_PUBLIC_URL ?? "http://localhost:5173", doorbell.qr_token);

  async function shareQr() {
    await Share.share({ message: `Campainha Digital QR: ${publicUrl}` });
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
        onPress: async () => setDoorbell(await rotateDoorbellToken(doorbell.id))
      }
    ]);
  }

  return (
    <Screen>
      <View className="gap-5">
        <View>
          <Text className="text-3xl font-bold text-ink">{doorbell.nome}</Text>
          <Text className="mt-1 text-muted">{doorbell.local}</Text>
        </View>
        <View ref={qrRef} collapsable={false} className="items-center rounded-xl bg-white p-5">
          <QRCode value={publicUrl} size={260} />
          <Text className="mt-4 text-center text-xs text-muted">{publicUrl}</Text>
        </View>
        <Text className="text-sm text-muted">
          O QR Code contém apenas um token aleatório. Não há nome, telefone, email ou endereço do morador no código.
        </Text>
        <Button title="Compartilhar" onPress={shareQr} />
        <Button title="Baixar imagem" onPress={downloadQr} variant="secondary" />
        <Button title="Gerar novo QR Code" onPress={rotate} variant="danger" />
      </View>
    </Screen>
  );
}
