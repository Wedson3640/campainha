import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Modal, Text, Vibration, View } from "react-native";
import type { VisitorCall } from "@campainha/shared";
import { loadSettings } from "@/lib/settings";
import { endCall, markCallViewed } from "@/services/calls";
import { Button } from "./Button";

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

  const local = call.doorbells?.local ?? "Campainha";
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
      <View className="flex-1 justify-center bg-black/50 px-5">
        <View className="rounded-2xl bg-white p-5">
          <Text className="text-2xl font-bold text-ink">Alguém está na porta</Text>
          <Text className="mt-3 text-base text-muted">{nome}</Text>
          <Text className="text-base text-muted">{local}</Text>
          <Text className="mt-2 text-sm text-muted">
            Horário: {new Date(call.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </Text>
          <Text className="mt-2 text-sm font-semibold text-alert">Status: {call.status}</Text>

          <View className="mt-5 gap-3">
            <Button title="Ver quem está na porta" onPress={viewVisitor} />
            <Button title="Encerrar campainha" onPress={closeAsEnded} variant="danger" />
            <Button
              title={muting ? "Silenciado" : "Silenciar"}
              variant="secondary"
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
