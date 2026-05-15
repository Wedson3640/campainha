import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { VisitorCall } from "@campainha/shared";
import { Screen } from "@/components/Screen";
import { listCalls } from "@/services/calls";

export default function HistoryScreen() {
  const [calls, setCalls] = useState<VisitorCall[]>([]);

  useEffect(() => {
    listCalls().then(setCalls);
  }, []);

  return (
    <Screen>
      <View className="gap-4">
        <Text className="text-3xl font-bold text-ink">Histórico</Text>
        {calls.map((call) => (
          <View key={call.id} className="rounded-xl bg-white p-4">
            <Text className="font-semibold text-ink">{call.doorbells?.nome ?? "Campainha"}</Text>
            <Text className="mt-1 text-muted">{new Date(call.created_at).toLocaleString("pt-BR")}</Text>
            <Text className="mt-1 text-sm text-muted">Status: {call.status}</Text>
            <Text className="mt-1 text-sm text-muted">{call.visitor_photo_url ? "Com foto" : "Sem foto"}</Text>
          </View>
        ))}
        {!calls.length ? <Text className="text-muted">Nenhuma chamada registrada.</Text> : null}
      </View>
    </Screen>
  );
}
