import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  dark?: boolean;
}>;

export function Screen({ children, scroll = true, dark = false }: ScreenProps) {
  const content = <View className="flex-1 px-5 py-4">{children}</View>;
  return (
    <SafeAreaView className={`flex-1 ${dark ? "bg-ink" : "bg-surface"}`}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}
