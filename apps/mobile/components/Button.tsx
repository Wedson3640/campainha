import { ActivityIndicator, Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
};

const variants = {
  primary: "bg-brand",
  secondary: "bg-white border border-slate-200",
  danger: "bg-danger"
};

const textVariants = {
  primary: "text-white",
  secondary: "text-ink",
  danger: "text-white"
};

export function Button({ title, onPress, variant = "primary", loading, disabled }: ButtonProps) {
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
      {!loading ? <Text className={`font-semibold ${textVariants[variant]}`}>{title}</Text> : null}
    </Pressable>
  );
}
