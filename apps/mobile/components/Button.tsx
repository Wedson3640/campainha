import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "dark" | "danger" | "muted";
  loading?: boolean;
  disabled?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
};

const variants = {
  primary: "bg-brand",
  secondary: "bg-white border border-slate-200",
  dark: "bg-ink",
  danger: "bg-danger",
  muted: "bg-slate-700"
};

const textVariants = {
  primary: "text-white",
  secondary: "text-ink",
  dark: "text-white",
  danger: "text-white",
  muted: "text-white"
};

export function Button({ title, onPress, variant = "primary", loading, disabled, icon }: ButtonProps) {
  const iconColor = variant === "secondary" ? "#0F172A" : "#FFFFFF";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-12 items-center justify-center rounded-lg ${variants[variant]} ${
        disabled || loading ? "opacity-60" : "opacity-100"
      }`}
    >
      {loading ? <ActivityIndicator color={variant === "secondary" ? "#0F172A" : "#FFFFFF"} /> : null}
      {!loading ? (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
          <Text className={`font-semibold ${textVariants[variant]}`}>{title}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
