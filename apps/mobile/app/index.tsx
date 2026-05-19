import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import type { Doorbell, VisitorCall } from "@campainha/shared";
import { buildPublicDoorbellUrl } from "@campainha/shared";
import QRCode from "react-native-qrcode-svg";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { listDoorbells } from "@/services/doorbells";
import { listCalls } from "@/services/calls";

export default function HomeScreen() {
  const [doorbells, setDoorbells] = useState<Doorbell[]>([]);
  const [lastCall, setLastCall] = useState<VisitorCall | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [nextDoorbells, calls] = await Promise.all([listDoorbells(), listCalls()]);
    setDoorbells(nextDoorbells);
    setLastCall(calls[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const primaryDoorbell = doorbells[0];
  const publicUrl = primaryDoorbell
    ? buildPublicDoorbellUrl(process.env.EXPO_PUBLIC_WEB_PUBLIC_URL ?? "http://localhost:5173", primaryDoorbell.qr_token)
    : "";

  return (
    <Screen dark>
      <View className="gap-5">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.push("/settings")} hitSlop={8}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </Pressable>
          <Image
            source={require("../assets/logo_transparent.png")}
            style={{ width: 140, height: 44 }}
            resizeMode="contain"
          />
          <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-slate-800">
            <Ionicons name="apps" size={18} color="#93C5FD" />
          </Pressable>
        </View>

        <View>
          <Text className="text-3xl font-bold text-white">Minha Campainha</Text>
          <Text className="mt-1 text-blue-100">QR Code ativo para receber visitas com segurança.</Text>
        </View>

        <View className="rounded-xl bg-white p-4">
          {primaryDoorbell ? (
            <>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand">
                    <Ionicons name="home" size={26} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="font-bold text-ink">{primaryDoorbell.nome}</Text>
                    <Text className="text-xs text-muted">{primaryDoorbell.local || "Sem local informado"}</Text>
                  </View>
                </View>
                <Text className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-success">
                  {primaryDoorbell.ativo ? "Ativa" : "Inativa"}
                </Text>
              </View>

              <Link href={{ pathname: "/doorbells/[id]", params: { id: primaryDoorbell.id } }} asChild>
                <Pressable className="mt-4 items-center rounded-xl bg-slate-50 p-4">
                  <QRCode value={publicUrl} size={210} />
                  <Text className="mt-3 text-center text-xs text-muted" numberOfLines={1}>
                    {publicUrl}
                  </Text>
                </Pressable>
              </Link>

              <View className="mt-4 rounded-lg bg-green-50 p-3">
                <Text className="text-xs font-semibold text-success">
                  Privacidade: o QR Code não expõe dados pessoais do morador.
                </Text>
              </View>
            </>
          ) : (
            <View className="items-center gap-3 py-8">
              <Ionicons name="qr-code" size={56} color="#2563EB" />
              <Text className="text-center text-lg font-bold text-ink">Cadastre sua primeira campainha</Text>
              <Text className="text-center text-muted">Crie um QR Code para visitantes chamarem você.</Text>
            </View>
          )}
        </View>

        <View className="gap-3">
          <Button
            title={primaryDoorbell ? "Compartilhar QR Code" : "Nova campainha"}
            icon={primaryDoorbell ? "share-social" : "add-circle"}
            onPress={() =>
              router.push(primaryDoorbell ? { pathname: "/doorbells/[id]", params: { id: primaryDoorbell.id } } : "/doorbells/new")
            }
            loading={loading}
          />
          <View className="flex-row gap-3">
            <Link href="/history" asChild>
              <Pressable className="h-14 flex-1 items-center justify-center rounded-lg bg-white">
                <Ionicons name="time-outline" size={20} color="#0F172A" />
                <Text className="mt-1 text-xs font-semibold text-ink">Histórico</Text>
              </Pressable>
            </Link>
            <Link href="/settings" asChild>
              <Pressable className="h-14 flex-1 items-center justify-center rounded-lg bg-white">
                <Ionicons name="settings-outline" size={20} color="#0F172A" />
                <Text className="mt-1 text-xs font-semibold text-ink">Configurações</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View className="rounded-xl bg-slate-900 p-4">
          <Text className="font-bold text-white">Última chamada</Text>
          {lastCall ? (
            <Text className="mt-2 text-blue-100">
              {new Date(lastCall.created_at).toLocaleString("pt-BR")} - {lastCall.status}
            </Text>
          ) : (
            <Text className="mt-2 text-blue-100">Nenhuma chamada recebida ainda.</Text>
          )}
        </View>

        {doorbells.length > 1 ? (
          <View className="gap-3">
            <Text className="text-lg font-semibold text-white">Outras campainhas</Text>
            {doorbells.slice(1).map((doorbell) => (
              <Link key={doorbell.id} href={{ pathname: "/doorbells/[id]", params: { id: doorbell.id } }} asChild>
                <Pressable className="rounded-xl bg-white p-4">
                  <Text className="text-base font-semibold text-ink">{doorbell.nome}</Text>
                  <Text className="mt-1 text-muted">{doorbell.local || "Sem local informado"}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
