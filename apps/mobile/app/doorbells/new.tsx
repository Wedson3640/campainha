import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { createDoorbell } from "@/services/doorbells";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";

export default function NewDoorbellScreen() {
  const { user } = useAuth();
  const [nome, setNome] = useState("Campainha Principal");
  const [local, setLocal] = useState("Portão da frente");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!user) return;
    if (!nome.trim()) return Alert.alert("Informe o nome da campainha.");
    setLoading(true);
    try {
      const doorbell = await createDoorbell(user.id, nome.trim(), local.trim());
      router.replace({ pathname: "/doorbells/[id]", params: { id: doorbell.id } });
    } catch (error) {
      Alert.alert("Erro ao salvar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="gap-4">
        <Text className="text-3xl font-bold text-ink">Nova campainha</Text>
        <TextInput
          placeholder="Nome da campainha"
          value={nome}
          onChangeText={setNome}
          className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-ink"
        />
        <TextInput
          placeholder="Local"
          value={local}
          onChangeText={setLocal}
          className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-ink"
        />
        <Button title="Salvar e gerar QR Code" onPress={save} loading={loading} />
      </View>
    </Screen>
  );
}
