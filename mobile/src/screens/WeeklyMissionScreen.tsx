import React from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../components/ui";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import type { WeeklyMission } from "../utils/weeklyMission";
import { missionTitleForWeek } from "../utils/weeklyMission";

export function WeeklyMissionCard({ mission, onPress }: { mission: WeeklyMission; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>WEEK {mission.week} MISSION</Text>
          <Text style={styles.cardCount}>
            {mission.achievedCount}/{mission.totalGoals}
          </Text>
        </View>
        <Text style={styles.cardTitle}>{missionTitleForWeek(mission.week)}</Text>
        <View style={styles.track}>
          <View
            style={[
              styles.trackFill,
              { width: `${mission.totalGoals ? (mission.achievedCount / mission.totalGoals) * 100 : 0}%` },
            ]}
          />
        </View>
      </Card>
    </Pressable>
  );
}

export function WeeklyMissionModal({
  visible,
  mission,
  onClose,
}: {
  visible: boolean;
  mission: WeeklyMission;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.eyebrow}>WEEK {mission.week} MISSION</Text>
          <Text style={styles.headline}>{missionTitleForWeek(mission.week).toUpperCase()}</Text>
          <Text style={styles.body}>
            Complete the following this week to hit your mission goal.
          </Text>

          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${mission.totalGoals ? (mission.achievedCount / mission.totalGoals) * 100 : 0}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {mission.achievedCount} / {mission.totalGoals}
          </Text>

          {mission.goals.length === 0 ? (
            <Card>
              <Text style={styles.body}>Add commitments in the Challenge tab to get a weekly mission.</Text>
            </Card>
          ) : (
            <Card>
              {mission.goals.map((g) => (
                <View key={g.commitmentId} style={styles.goalRow}>
                  <View style={[styles.goalDot, g.achieved && styles.goalDotDone]}>
                    {g.achieved ? <Text style={styles.goalCheck}>✓</Text> : null}
                  </View>
                  <Text style={styles.goalIcon}>{g.icon}</Text>
                  <Text style={styles.goalTitle}>{g.title}</Text>
                  <Text style={styles.goalCount}>
                    {g.count}/{g.target}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          <Card style={{ borderColor: COLORS.gold, borderWidth: 1 }}>
            <Text style={styles.rewardTitle}>🏅 Mission reward</Text>
            <Text style={styles.body}>
              {mission.allAchieved
                ? `You hit every goal this week — nice work.`
                : `Get the Week ${mission.week} badge for hitting every goal above.`}
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.md },
  back: { color: COLORS.accent, fontSize: 14, fontWeight: "700" },
  eyebrow: { color: COLORS.textFaint, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  headline: { color: COLORS.text, fontFamily: FONTS.display, fontSize: 40, lineHeight: 42 },
  body: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  progressLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  cardCount: { color: COLORS.gold, fontSize: 13, fontWeight: "800" },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  track: { height: 8, borderRadius: 4, backgroundColor: COLORS.surface, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: COLORS.gold, borderRadius: 4 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: 6 },
  goalDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  goalDotDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  goalCheck: { color: "#06210F", fontSize: 12, fontWeight: "900" },
  goalIcon: { fontSize: 16 },
  goalTitle: { color: COLORS.text, fontSize: 14, fontWeight: "600", flex: 1 },
  goalCount: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  rewardTitle: { color: COLORS.gold, fontSize: 15, fontWeight: "800" },
});
