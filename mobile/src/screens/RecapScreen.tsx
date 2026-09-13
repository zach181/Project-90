import React from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeroBackground } from "../components/HeroBackground";
import { PrimaryButton, GhostButton } from "../components/ui";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import type { Challenge } from "../types";
import type { ProgressSummary } from "../utils/challenge";

export function RecapModal({
  visible,
  challenge,
  summary,
  onClose,
  onRestart,
}: {
  visible: boolean;
  challenge: Challenge;
  summary: ProgressSummary;
  onClose: () => void;
  onRestart: () => void;
}) {
  const completionPct = Math.round((summary.completedDays / summary.totalDays) * 100);

  const share = () => {
    Share.share({
      message: `I just finished ${challenge.name} on Project 90 — ${summary.completedDays}/${summary.totalDays} days completed, ${summary.longestStreak}-day best streak.`,
    }).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <HeroBackground variant="banner" style={styles.hero}>
            <Pressable onPress={onClose} hitSlop={12} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            <View style={styles.heroContent}>
              <Text style={styles.eyebrow}>90-DAY RECAP</Text>
              <Text style={styles.wordmark}>Project 90</Text>
              <Text style={styles.headline}>You did it.</Text>
            </View>
          </HeroBackground>

          <View style={styles.body}>
            <Text style={styles.sectionLabel}>Final stats</Text>
            <View style={styles.statGrid}>
              <Stat value={`${summary.completedDays}`} label="Days completed" />
              <Stat value={`${completionPct}%`} label="Completion rate" />
              <Stat value={`${summary.longestStreak}`} label="Longest streak" />
              <Stat value={`${challenge.commitments.length}`} label="Daily commitments" />
            </View>

            <PrimaryButton label="Share my journey" tone="green" onPress={share} />
            <PrimaryButton label="Start a new 90" onPress={onRestart} />
            <GhostButton label="Close" onPress={onClose} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 320, justifyContent: "space-between" },
  back: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  backText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  heroContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: 4 },
  eyebrow: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "700", letterSpacing: 1.2 },
  wordmark: { color: "#fff", fontSize: 20, fontWeight: "800", fontStyle: "italic" },
  headline: { color: "#fff", fontFamily: FONTS.display, fontSize: 44, marginTop: 6 },
  body: { padding: SPACING.lg, gap: SPACING.md },
  sectionLabel: {
    color: COLORS.textFaint,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  stat: {
    width: "47%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    gap: 4,
  },
  statValue: { color: COLORS.text, fontFamily: FONTS.display, fontSize: 28 },
  statLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
});
