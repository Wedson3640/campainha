import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function phoneDigits(formatted: string) {
  return formatted.replace(/\D/g, "");
}

export default function ProfileSetupScreen() {
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    const trimmedNome = nome.trim();
    const digits = phoneDigits(phone);

    if (!trimmedNome) return Alert.alert("Nome obrigatório", "Digite seu nome completo.");
    if (digits.length < 10 || digits.length > 11)
      return Alert.alert("Telefone inválido", "Digite um telefone válido com DDD (ex: (11) 91234-5678).");

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); router.replace("/login"); return; }

    const [profileResult, metaResult] = await Promise.all([
      supabase.from("profiles").upsert({ id: user.id, nome: trimmedNome, phone: digits }),
      supabase.auth.updateUser({ data: { display_name: trimmedNome, phone: digits } }),
    ]);

    setLoading(false);
    if (profileResult.error) return Alert.alert("Erro", profileResult.error.message);
    if (metaResult.error) return Alert.alert("Erro", metaResult.error.message);

    router.replace("/");
  }

  return (
    <Screen scroll={false}>
      <View className="flex-1 justify-center gap-4">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-ink">Complete seu perfil</Text>
          <Text className="mt-2 text-base text-muted">Essas informações identificam você na campainha.</Text>
        </View>
        <TextInput
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-ink"
        />
        <TextInput
          placeholder="Telefone com DDD (ex: (11) 91234-5678)"
          value={phone}
          onChangeText={(text) => setPhone(formatPhone(text))}
          keyboardType="phone-pad"
          className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-ink"
        />
        <Button title="Salvar e continuar" onPress={save} loading={loading} />
      </View>
    </Screen>
  );
}
