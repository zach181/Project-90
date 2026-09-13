import React, { useMemo, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Segmented } from "../components/ui";
import { HexBadge } from "../components/HexBadge";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { useChallengeStore } from "../store/challengeStore";
import { useLogStore } from "../store/logStore";
import { summarize } from "../utils/challenge";
import { computeAchievements } from "../utils/achievements";
import { todayISO } from "../utils/date";

export function AchievementsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const challenge = useChallengeStore((s) => s.challenge);
  const logs = useLogStore((s) => s.logs);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const achievements = useMemo(() => {
    if (!challenge) return [];
    const summary = summarize(challenge, logs, todayISO());
    return computeAchievements(challenge, logs, summary);
  }, [challenge, logs]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const visible_ = achievements.filter((a) =>
    filter === "all" ? true : filter === "unlocked" ? a.unlocked : !a.unlocked
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            {unlockedCount} of {achievements.length} unlocked
          </Text>
        </View>

        <View style={styles.tabsWrap}>
          <Segmented
            options={[
              { value: "all", label: "All" },
              { value: "unlocked", label: "Unlocked" },
              { value: "locked", label: "Locked" },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {visible_.map((a) => {
            const fill = !a.unlocked ? COLORS.surface : a.gold ? COLORS.goldSoft : COLORS.accentSoft;
            const stroke = !a.unlocked ? COLORS.border : a.gold ? COLORS.gold : COLORS.accent;
            return (
              <View key={a.id} style={styles.badgeCard}>
                <HexBadge size={64} fill={fill} stroke={stroke} icon={a.unlocked ? a.icon : "🔒"} />
                <Text style={[styles.badgeTitle, !a.unlocked && styles.badgeTitleLocked]}>{a.title}</Text>
                <Text style={styles.badgeDesc}>{a.description}</Text>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, gap: 6 },
  back: { color: COLORS.accent, fontSize: 14, fontWeight: "700", marginBottom: SPACING.sm },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  subtitle: { color: COLORS.textMuted, fontSize: 13 },
  tabsWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.lg,
    gap: SPACING.md,
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "47%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    gap: 6,
  },
  badgeTitle: { color: COLORS.text, fontSize: 13, fontWeight: "800", textAlign: "center", marginTop: 4 },
  badgeTitleLocked: { color: COLORS.textFaint },
  badgeDesc: { color: COLORS.textMuted, fontSize: 11, textAlign: "center" },
});
