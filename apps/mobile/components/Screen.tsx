import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  dark?: boolean;
}>;

export function Screen({ children, scroll = true, dark = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = (
    <View className="flex-1 px-5 py-4" style={{ paddingTop: insets.top + 16 }}>
      {children}
    </View>
  );
  return (
    <View className={`flex-1 ${dark ? "bg-ink" : "bg-surface"}`}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </View>
  );
}
