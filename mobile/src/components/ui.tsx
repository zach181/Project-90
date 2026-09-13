import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ViewStyle,
  StyleProp,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, { flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = "accent",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "accent" | "green" | "red";
}) {
  const bg = tone === "green" ? COLORS.green : tone === "red" ? COLORS.red : COLORS.accent;
  const textColor = tone === "red" ? "#fff" : "#06210F";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        { backgroundColor: bg, opacity: disabled ? 0.35 : pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.primaryBtnText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  tone = "muted",
}: {
  label: string;
  onPress: () => void;
  tone?: "muted" | "red";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text
        style={[styles.ghostBtnText, tone === "red" && { color: COLORS.red }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Underlined text tabs — e.g. "OVERVIEW / STATS / HISTORY". */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={styles.segment}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {opt.label.toUpperCase()}
            </Text>
            <View style={[styles.segmentUnderline, active && styles.segmentUnderlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({
  onDecrement,
  onIncrement,
  disabledDecrement,
}: {
  onDecrement: () => void;
  onIncrement: () => void;
  disabledDecrement?: boolean;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={onDecrement}
        disabled={disabledDecrement}
        style={[styles.stepBtn, disabledDecrement && { opacity: 0.3 }]}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Pressable onPress={onIncrement} style={[styles.stepBtn, styles.stepBtnFilled]}>
        <Text style={[styles.stepBtnText, { color: "#06210F" }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  header: { gap: 4, marginBottom: SPACING.xs },
  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 14 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.textFaint,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  primaryBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800" },
  ghostBtn: { paddingVertical: 12, alignItems: "center" },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 15, fontWeight: "600" },
  segmented: { flexDirection: "row", gap: SPACING.lg },
  segment: { alignItems: "center", gap: 8, paddingBottom: 8 },
  segmentText: { color: COLORS.textFaint, fontSize: 12, fontWeight: "700", letterSpacing: 0.6 },
  segmentTextActive: { color: COLORS.accent },
  segmentUnderline: { height: 2, width: "100%", borderRadius: 1, backgroundColor: "transparent" },
  segmentUnderlineActive: { backgroundColor: COLORS.accent },
  stepper: { flexDirection: "row", gap: SPACING.sm },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnFilled: { backgroundColor: COLORS.accent },
  stepBtnText: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
});
