import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

type Mode = "in" | "up";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  async function signIn() {
    if (!isValidEmail(email)) return Alert.alert("Email inválido", "Digite um email válido.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return Alert.alert("Não foi possível entrar", error.message);
    router.replace("/");
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
      Alert.alert("Confirme seu email", "Acesse sua caixa de entrada e clique no link de confirmação.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#1E40AF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200}
    >
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho azul com logo */}
        <View
          style={{
            backgroundColor: "#1E40AF",
            paddingTop: insets.top + 32,
            paddingBottom: 56,
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <Image
            source={require("../assets/logo_transparent.png")}
            style={{ width: 220, height: 88 }}
            resizeMode="contain"
          />
          <Text style={{ color: "#BFDBFE", marginTop: 10, fontSize: 15, textAlign: "center" }}>
            Sua campainha digital.{"\n"}Simples, segura e moderna.
          </Text>
        </View>

        {/* Card branco com formulário */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#F8FAFC",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -28,
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 32,
          }}
        >
          {/* Ícone de usuário */}
          <View
            style={{
              alignSelf: "center",
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="person-outline" size={34} color="#2563EB" />
          </View>

          <Text style={{ fontSize: 24, fontWeight: "800", textAlign: "center", color: "#0F172A", marginBottom: 6 }}>
            {mode === "in" ? "Acesse sua conta" : "Criar conta"}
          </Text>
          <Text style={{ textAlign: "center", color: "#64748B", fontSize: 14, marginBottom: 28, lineHeight: 20 }}>
            {mode === "in"
              ? "Entre para gerenciar suas campainhas,\nchamadas e configurações."
              : "Preencha os dados para criar sua conta."}
          </Text>

          {/* Campo email */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 12,
              paddingHorizontal: 14,
              height: 54,
              marginBottom: 12,
            }}
          >
            <Ionicons name="mail-outline" size={20} color="#2563EB" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
            />
          </View>

          {/* Campo senha */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 12,
              paddingHorizontal: 14,
              height: 54,
              marginBottom: 8,
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#2563EB" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
            />
            <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
            </Pressable>
          </View>

          {mode === "in" && (
            <Pressable style={{ alignSelf: "flex-end", marginBottom: 20 }}>
              <Text style={{ color: "#2563EB", fontWeight: "600", fontSize: 13 }}>Esqueci minha senha</Text>
            </Pressable>
          )}

          {mode === "up" && <View style={{ height: 20 }} />}

          {/* Botão entrar / criar */}
          <Pressable
            onPress={mode === "in" ? signIn : signUp}
            disabled={loading}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 12,
              height: 54,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Ionicons
              name={mode === "in" ? "log-in-outline" : "person-add-outline"}
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
              {loading ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
            </Text>
          </Pressable>

          {/* Alternar modo */}
          <Pressable
            onPress={() => setMode((m) => (m === "in" ? "up" : "in"))}
            style={{
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 12,
              height: 54,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              marginBottom: 20,
            }}
          >
            <Ionicons
              name={mode === "in" ? "person-add-outline" : "log-in-outline"}
              size={18}
              color="#0F172A"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#475569", fontSize: 14 }}>
              {mode === "in" ? "Ainda não tem conta? " : "Já tem conta? "}
              <Text style={{ color: "#2563EB", fontWeight: "700" }}>
                {mode === "in" ? "Criar conta" : "Entrar"}
              </Text>
            </Text>
          </Pressable>

          {/* Rodapé privacidade */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Ionicons name="shield-checkmark-outline" size={15} color="#64748B" />
            <Text style={{ color: "#64748B", fontSize: 13 }}>Seus dados estão protegidos com segurança.</Text>
          </View>

          <Text style={{ textAlign: "center", color: "#CBD5E1", fontSize: 11, marginTop: 16 }}>
            TEST-007
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
