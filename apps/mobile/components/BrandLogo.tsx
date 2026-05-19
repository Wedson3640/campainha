import { Image, Text, View } from "react-native";

type BrandLogoProps = {
  compact?: boolean;
  light?: boolean;
};

export function BrandLogo({ compact = false, light = false }: BrandLogoProps) {
  return (
    <View className={compact ? "items-start" : "items-center"}>
      <Image source={light ? require("../assets/logo_transparent.png") : require("../assets/logo.png")} className={compact ? "h-12 w-48" : "h-16 w-64"} resizeMode="contain" />
      {!compact ? (
        <Text className={`mt-1 text-center text-sm ${light ? "text-blue-100" : "text-muted"}`}>
          Sua campainha digital. Simples, segura e moderna.
        </Text>
      ) : null}
    </View>
  );
}
