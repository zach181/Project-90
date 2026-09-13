import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../constants/theme";

/** Shared brand header rendered above every tab. */
export function TopBar({
  dayLabel,
  streak,
  onSettingsPress,
}: {
  dayLabel?: string;
  streak?: number;
  onSettingsPress?: () => void;
}) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.bar}>
        <View style={styles.left}>
          <Text style={styles.menuIcon}>☰</Text>
          <Text style={styles.wordmark}>Project 90</Text>
        </View>
        <View style={styles.pills}>
          {dayLabel ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{dayLabel}</Text>
            </View>
          ) : null}
          {typeof streak === "number" && streak > 0 ? (
            <View style={[styles.pill, styles.streakPill]}>
              <Text style={styles.pillText}>🔥 {streak}</Text>
            </View>
          ) : null}
          <Pressable onPress={onSettingsPress} hitSlop={8}>
            <Text style={styles.gearIcon}>⚙️</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: COLORS.background },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.xs,
  },
  left: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  menuIcon: { color: "rgba(255,255,255,0.55)", fontSize: 18 },
  wordmark: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  pills: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  pill: {
    backgroundColor: COLORS.chip,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakPill: { backgroundColor: COLORS.goldSoft },
  pillText: { color: COLORS.text, fontWeight: "700", fontSize: 12 },
  gearIcon: { fontSize: 16, marginLeft: 2 },
});
