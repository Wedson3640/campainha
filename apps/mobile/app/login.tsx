import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";

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
      <View className="flex-1 justify-center gap-4">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-ink">Campainha Digital QR</Text>
          <Text className="mt-2 text-base text-muted">Entre para gerenciar sua campainha segura por QR Code.</Text>
        </View>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-ink"
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-ink"
        />
        <Button title="Entrar" onPress={signIn} loading={loading} />
        <Button title="Criar conta" onPress={signUp} variant="secondary" loading={loading} />
      </View>
    </Screen>
  );
}
