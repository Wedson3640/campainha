import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";
import { Link, router } from "expo-router";
import type { Doorbell, VisitorCall } from "@campainha/shared";
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

  return (
    <Screen>
      <View className="gap-5">
        <View>
          <Text className="text-3xl font-bold text-ink">Início</Text>
          <Text className="mt-1 text-muted">Status: Campainha ativa</Text>
        </View>

        <View className="rounded-xl bg-white p-4">
          <Text className="text-lg font-semibold text-ink">Última chamada</Text>
          {lastCall ? (
            <Text className="mt-2 text-muted">
              {new Date(lastCall.created_at).toLocaleString("pt-BR")} - {lastCall.status}
            </Text>
          ) : (
            <Text className="mt-2 text-muted">Nenhuma chamada recebida ainda.</Text>
          )}
        </View>

        <View className="gap-3">
          <Button title="Nova campainha" onPress={() => router.push("/doorbells/new")} />
          <View className="flex-row gap-3">
            <Link href="/history" asChild>
              <Pressable className="h-12 flex-1 items-center justify-center rounded-lg bg-white">
                <Text className="font-semibold text-ink">Histórico</Text>
              </Pressable>
            </Link>
            <Link href="/settings" asChild>
              <Pressable className="h-12 flex-1 items-center justify-center rounded-lg bg-white">
                <Text className="font-semibold text-ink">Configurações</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View>
          <Text className="mb-3 text-lg font-semibold text-ink">Campainhas cadastradas</Text>
          <View className="gap-3">
            {doorbells.map((doorbell) => (
              <Link key={doorbell.id} href={{ pathname: "/doorbells/[id]", params: { id: doorbell.id } }} asChild>
                <Pressable className="rounded-xl bg-white p-4">
                  <Text className="text-base font-semibold text-ink">{doorbell.nome}</Text>
                  <Text className="mt-1 text-muted">{doorbell.local || "Sem local informado"}</Text>
                  <Text className="mt-2 text-xs text-success">{doorbell.ativo ? "Ativa" : "Inativa"}</Text>
                </Pressable>
              </Link>
            ))}
            {!doorbells.length ? <Text className="text-muted">Cadastre sua primeira campainha.</Text> : null}
          </View>
        </View>
      </View>
    </Screen>
  );
}
