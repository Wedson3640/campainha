import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { BrandLogo } from "@/components/BrandLogo";

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
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const [profileResult, metaResult] = await Promise.all([
      supabase.from("profiles").upsert({ id: user.id, nome: trimmedNome, phone: digits }),
      supabase.auth.updateUser({ data: { display_name: trimmedNome, phone: digits } })
    ]);

    setLoading(false);
    if (profileResult.error) return Alert.alert("Erro", profileResult.error.message);
    if (metaResult.error) return Alert.alert("Erro", metaResult.error.message);

    router.replace("/");
  }

  return (
    <Screen scroll={false}>
      <View className="flex-1 justify-between py-5">
        <BrandLogo />

        <View className="rounded-xl bg-white p-5">
          <View className="mx-auto h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Ionicons name="person-add-outline" size={34} color="#2563EB" />
          </View>
          <Text className="mt-4 text-center text-2xl font-bold text-ink">Criando conta</Text>
          <Text className="mt-3 text-center text-muted">Complete seu perfil para identificar suas campainhas.</Text>

          <View className="mt-6 gap-3">
            <TextInput
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-ink"
            />
            <TextInput
              placeholder="Telefone com DDD"
              value={phone}
              onChangeText={(text) => setPhone(formatPhone(text))}
              keyboardType="phone-pad"
              className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-ink"
            />
            <Button title="Salvar e continuar" icon="checkmark-circle" onPress={save} loading={loading} />
          </View>
        </View>
      </View>
    </Screen>
  );
}
