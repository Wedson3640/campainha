import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!isValidEmail(email)) return Alert.alert("Email inválido", "Digite um email válido.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return Alert.alert("Não foi possível entrar", error.message);
    router.replace("/");
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function signUp() {
    if (!isValidEmail(email)) return Alert.alert("Email inválido", "Digite um email válido.");
    if (password.length < 6) return Alert.alert("Senha fraca", "A senha deve ter pelo menos 6 caracteres.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (!error && data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, nome: email.split("@")[0] });
    }
    setLoading(false);
    if (error) return Alert.alert("Não foi possível criar conta", error.message);

    if (data.session) {
      router.replace("/profile-setup");
    } else {
      Alert.alert("Confirme seu email", "Acesse sua caixa de entrada e clique no link de confirmação antes de entrar.");
    }
  }

  return (
    <Screen scroll={false}>
      <View className="flex-1 justify-between py-5">
        <BrandLogo />

        <View className="rounded-xl bg-white p-5">
          <View className="mx-auto h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Ionicons name="person-outline" size={34} color="#2563EB" />
          </View>

          <Text className="mt-4 text-center text-2xl font-bold text-ink">Conta</Text>
          <Text className="mt-3 text-center text-muted">
            Faça login ou crie sua conta para acessar suas campainhas, histórico de chamadas e configurações.
          </Text>

          <View className="mt-6 gap-3">
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-ink"
            />
            <TextInput
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-ink"
            />
            <Button title="Entrar" icon="log-in" onPress={signIn} loading={loading} variant="dark" />
            <Button title="Criar conta" icon="person-add" onPress={signUp} variant="secondary" loading={loading} />
          </View>

          <View className="mt-6 flex-row items-center justify-center gap-2">
            <Ionicons name="lock-closed-outline" size={15} color="#64748B" />
            <Text className="text-xs text-muted">Seus dados estão protegidos.</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}
