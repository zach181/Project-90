import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { Screen, ScreenHeader, Card, SectionLabel, GhostButton } from "../components/ui";
import { ProgressRing } from "../components/ProgressRing";
import { AchievementsModal } from "./AchievementsScreen";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import { useChallengeStore } from "../store/challengeStore";
import { useLogStore } from "../store/logStore";
import { commitmentMet, dateForDay, summarize } from "../utils/challenge";
import { computeAchievements } from "../utils/achievements";
import { prettyDate, todayISO } from "../utils/date";

const CELL_STATE_COLOR: Record<string, string> = {
  done: COLORS.accent,
  missed: COLORS.red,
  today: COLORS.gold,
  future: COLORS.surface,
};

export default function ProgressScreen() {
  const challenge = useChallengeStore((s) => s.challenge);
  const logs = useLogStore((s) => s.logs);
  const [selected, setSelected] = useState<number | null>(null);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  if (!challenge) return null;
  const summary = summarize(challenge, logs, todayISO());
  const achievements = computeAchievements(challenge, logs, summary);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const completionPct = Math.round(
    (summary.completedDays / Math.max(1, summary.dayNumber > summary.totalDays ? summary.totalDays : summary.dayNumber)) *
      100
  );

  const selectedDate = selected ? dateForDay(challenge, selected) : null;
  const selectedLog = selectedDate ? logs[selectedDate] : undefined;

  return (
    <Screen>
      <ScreenHeader title="Progress" subtitle={challenge.name} />

      <Card>
        <SectionLabel>Your journey</SectionLabel>
        <View style={styles.journeyBody}>
          <ProgressRing progress={completionPct / 100} size={104} strokeWidth={10}>
            <Text style={styles.ringBig}>{completionPct}%</Text>
          </ProgressRing>
          <View style={styles.journeyStats}>
            <JourneyStat icon="🔥" label="Current streak" value={`${summary.currentStreak}`} />
            <JourneyStat icon="🏆" label="Best streak" value={`${summary.longestStreak}`} />
            <JourneyStat icon="✅" label="Days done" value={`${summary.completedDays}/${summary.totalDays}`} />
          </View>
        </View>
      </Card>

      <Pressable style={styles.achievementsRow} onPress={() => setAchievementsOpen(true)}>
        <Text style={styles.achievementsIcon}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <Text style={styles.achievementsSub}>
            {unlockedCount} of {achievements.length} unlocked
          </Text>
        </View>
        <Text style={styles.achievementsArrow}>→</Text>
      </Pressable>

      <Card>
        <SectionLabel>The 90</SectionLabel>
        <View style={styles.grid}>
          {summary.dayStates.map((state, i) => (
            <Pressable
              key={i}
              onPress={() => setSelected(i + 1)}
              style={[
                styles.cell,
                { backgroundColor: CELL_STATE_COLOR[state] },
                state === "today" && styles.cellToday,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  state === "future" && { color: COLORS.textFaint },
                  state === "today" && { color: "#241B03" },
                ]}
              >
                {i + 1}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.legend}>
          <LegendDot color={COLORS.accent} label="Done" />
          <LegendDot color={COLORS.red} label="Missed" />
          <LegendDot color={COLORS.gold} label="Today" />
          <LegendDot color={COLORS.surface} label="Upcoming" />
        </View>
      </Card>

      <Card>
        <SectionLabel>By commitment</SectionLabel>
        {summary.perCommitment.map((pc) => {
          const pct = pc.possible ? pc.done / pc.possible : 0;
          return (
            <View key={pc.id} style={{ gap: 6 }}>
              <View style={styles.pcHead}>
                <Text style={styles.pcTitle}>
                  {pc.icon}  {pc.title}
                </Text>
                <Text style={styles.pcCount}>
                  {pc.done}/{pc.possible}
                </Text>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%` }]} />
              </View>
            </View>
          );
        })}
        {summary.perCommitment.length === 0 && (
          <Text style={styles.muted}>No commitments yet.</Text>
        )}
      </Card>

      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.dayCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.dayCardTitle}>
              Day {selected}
              {selectedDate ? ` · ${prettyDate(selectedDate)}` : ""}
            </Text>
            {challenge.commitments.map((c) => {
              const met = commitmentMet(c, selectedLog?.entries[c.id]);
              return (
                <View key={c.id} style={styles.dayRow}>
                  <Text style={styles.dayRowText}>
                    {c.icon}  {c.title}
                  </Text>
                  <Text style={{ color: met ? COLORS.accent : COLORS.textFaint, fontWeight: "800" }}>
                    {met ? "✓" : "—"}
                  </Text>
                </View>
              );
            })}
            {selectedLog?.note ? (
              <Text style={styles.dayNote}>"{selectedLog.note}"</Text>
            ) : null}
            <GhostButton label="Close" onPress={() => setSelected(null)} />
          </Pressable>
        </Pressable>
      </Modal>

      <AchievementsModal visible={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
    </Screen>
  );
}

function JourneyStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.journeyStatRow}>
      <Text style={styles.journeyStatIcon}>{icon}</Text>
      <Text style={styles.journeyStatLabel}>{label}</Text>
      <Text style={styles.journeyStatValue}>{value}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  journeyBody: { flexDirection: "row", alignItems: "center", gap: SPACING.lg },
  ringBig: { color: COLORS.text, fontFamily: FONTS.display, fontSize: 24 },
  journeyStats: { flex: 1, gap: SPACING.sm },
  journeyStatRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  journeyStatIcon: { fontSize: 14, width: 18 },
  journeyStatLabel: { flex: 1, color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  journeyStatValue: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  achievementsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  achievementsIcon: { fontSize: 24 },
  achievementsTitle: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  achievementsSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  achievementsArrow: { color: COLORS.accent, fontSize: 18, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "space-between" },
  cell: {
    width: "9%",
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cellToday: { borderWidth: 2, borderColor: "#fff" },
  cellText: { color: "#06210F", fontSize: 10, fontWeight: "700" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, marginTop: SPACING.xs },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  muted: { color: COLORS.textMuted, fontSize: 12 },
  pcHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pcTitle: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  pcCount: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  bar: { height: 8, borderRadius: 4, backgroundColor: COLORS.surface, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: COLORS.accent, borderRadius: 4 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  dayCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    width: "100%",
    maxWidth: 380,
  },
  dayCardTitle: { color: COLORS.text, fontSize: 17, fontWeight: "800", marginBottom: 4 },
  dayRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  dayRowText: { color: COLORS.text, fontSize: 14 },
  dayNote: { color: COLORS.textMuted, fontStyle: "italic", fontSize: 13, marginTop: 4 },
});
