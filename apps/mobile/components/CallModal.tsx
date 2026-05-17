import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Modal, Text, Vibration, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { VisitorCall } from "@campainha/shared";
import { loadSettings } from "@/lib/settings";
import { endCall, markCallViewed } from "@/services/calls";
import { Button } from "./Button";
import { BrandLogo } from "./BrandLogo";

type CallModalProps = {
  call: VisitorCall | null;
  onClose: () => void;
  onView: (call: VisitorCall) => void;
};

export function CallModal({ call, onClose, onView }: CallModalProps) {
  const [muting, setMuting] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  async function stopAlert() {
    Vibration.cancel();
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => undefined);
      await soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
  }

  useEffect(() => {
    if (!call) return;
    setMuting(false);

    loadSettings().then((settings) => {
      if (!settings.silentMode && settings.soundEnabled) {
        Audio.Sound.createAsync(require("../assets/doorbell.wav"), {
          shouldPlay: true,
          isLooping: true,
          volume: 1
        })
          .then(({ sound }) => {
            soundRef.current = sound;
          })
          .catch(() => undefined);
      }
      if (!settings.silentMode && settings.vibrationEnabled) {
        Vibration.vibrate([0, 700, 250, 700], true);
      }
    });

    return () => {
      void stopAlert();
    };
  }, [call]);

  if (!call) return null;

  const local = call.doorbells?.local ?? "Portão da frente";
  const nome = call.doorbells?.nome ?? "Campainha Digital";

  async function closeAsEnded() {
    if (!call) return;
    await stopAlert();
    await endCall(call.id);
    onClose();
  }

  async function viewVisitor() {
    if (!call) return;
    await stopAlert();
    await markCallViewed(call.id);
    onView(call);
  }

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 justify-center bg-ink px-5">
        <View className="gap-5 rounded-xl bg-slate-900 p-5">
          <BrandLogo light />
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full border border-blue-300 bg-brand">
              <Ionicons name="notifications" size={34} color="#FFFFFF" />
            </View>
            <Text className="mt-4 text-center text-3xl font-bold text-white">Alguém está na porta</Text>
            <Text className="mt-2 text-center text-lg font-semibold text-blue-200">{local || nome}</Text>
            <Text className="mt-1 text-center text-blue-100">
              {new Date(call.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>

          <View className="h-56 items-center justify-center rounded-xl bg-slate-800">
            <Ionicons name="person-circle-outline" size={96} color="#93C5FD" />
            <Text className="mt-2 text-blue-100">Chamada recebida</Text>
          </View>

          <View className="gap-3">
            <Button title="Ver quem está na porta" icon="camera" onPress={viewVisitor} />
            <Button title="Encerrar campainha" icon="call" onPress={closeAsEnded} variant="danger" />
            <Button
              title={muting ? "Silenciado" : "Silenciar"}
              icon={muting ? "volume-mute" : "notifications-off-outline"}
              variant="muted"
              onPress={async () => {
                await stopAlert();
                setMuting(true);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
