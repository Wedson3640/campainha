import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import type { AppSettings } from "@campainha/shared";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { defaultSettings, loadSettings, saveSettings } from "@/lib/settings";
import { supabase } from "@/lib/supabase";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  async function update(next: AppSettings) {
    setSettings(next);
    await saveSettings(next);
  }

  return (
    <Screen>
      <View className="gap-5">
        <Text className="text-3xl font-bold text-ink">Configurações</Text>
        {[
          ["Som", "soundEnabled"],
          ["Vibração", "vibrationEnabled"],
          ["Modo silencioso", "silentMode"]
        ].map(([label, key]) => (
          <View key={key} className="flex-row items-center justify-between rounded-xl bg-white p-4">
            <Text className="font-semibold text-ink">{label}</Text>
            <Switch
              value={Boolean(settings[key as keyof AppSettings])}
              onValueChange={(value) => update({ ...settings, [key]: value })}
            />
          </View>
        ))}
        <Text className="text-sm text-muted">Som atual: padrão do sistema. Sons personalizados podem ser adicionados em assets no próximo ciclo.</Text>
        <Button title="Sair da conta" variant="danger" onPress={() => supabase.auth.signOut()} />
      </View>
    </Screen>
  );
}
