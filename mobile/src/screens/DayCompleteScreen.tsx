import React from "react";
import { Modal, View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeroBackground } from "../components/HeroBackground";
import { ProgressRing } from "../components/ProgressRing";
import { Card, PrimaryButton, GhostButton, SectionLabel } from "../components/ui";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import type { Challenge, DayLog } from "../types";
import type { ProgressSummary } from "../utils/challenge";
import { formatWeight, weightSeries } from "../utils/weight";

function messageFor(day: number, streak: number, total: number): string {
  if (day >= total) return "You made it all the way through. Your recap is ready.";
  if (day === 1) return "Day one is in the books.";
  if (streak > 0 && streak % 7 === 0) {
    const weeks = streak / 7;
    return `${streak} days straight — ${weeks} full week${weeks === 1 ? "" : "s"} locked in.`;
  }
  if (day === Math.ceil(total / 2)) return "Halfway there.";
  if (streak >= 3) return `${streak} days in a row. Keep the streak alive.`;
  return "Another day done. Come back tomorrow.";
}

/** Shown right after you lock in a day: which day you finished and where you stand. */
export function DayCompleteModal({
  visible,
  challenge,
  summary,
  logs,
  date,
  day,
  onClose,
  onViewRecap,
}: {
  visible: boolean;
  challenge: Challenge;
  summary: ProgressSummary;
  logs: Record<string, DayLog>;
  date: string;
  /** today's day number, clamped to 1..totalDays */
  day: number;
  onClose: () => void;
  onViewRecap: () => void;
}) {
  const total = challenge.totalDays;
  const isFinal = day >= total;
  const pct = Math.round((summary.completedDays / total) * 100);

  const weekStart = (Math.ceil(day / 7) - 1) * 7 + 1;
  const weekEnd = Math.min(weekStart + 6, total);
  const weekDays = Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => weekStart + i);

  const todayLog = logs[date];
  const weightToday = todayLog?.weight;
  const series = weightSeries(challenge, logs);
  const weightChange =
    weightToday !== undefined && series.length > 1
      ? Math.round((weightToday - series[0].weight) * 10) / 10
      : null;

  const photoId = challenge.commitments.find((c) => c.type === "photo")?.id;
  const photoEntry = photoId ? todayLog?.entries[photoId] : undefined;
  const photoUri = photoEntry?.kind === "photo" ? photoEntry.uri : "";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["bottom"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <HeroBackground variant="banner" style={styles.hero}>
            <SafeAreaView edges={["top"]} style={styles.heroInner}>
              <Text style={styles.eyebrow}>{isFinal ? "FINAL DAY COMPLETE" : "DAY COMPLETE"}</Text>
              <View>
                <Text style={styles.headline}>{isFinal ? `That's ${total}.` : `Day ${day}`}</Text>
                <Text style={styles.message}>{messageFor(day, summary.currentStreak, total)}</Text>
              </View>
            </SafeAreaView>
          </HeroBackground>

          <View style={styles.body}>
            <Card>
              <SectionLabel>Your progress</SectionLabel>
              <View style={styles.progressRow}>
                <ProgressRing progress={summary.completedDays / total} size={104} strokeWidth={10}>
                  <Text style={styles.ringValue}>{summary.completedDays}</Text>
                  <Text style={styles.ringTotal}>of {total}</Text>
                </ProgressRing>
                <View style={styles.stats}>
                  <Stat icon="🔥" label="Streak" value={`${summary.currentStreak}`} />
                  <Stat icon="✅" label="Complete" value={`${pct}%`} />
                  <Stat icon="⛰️" label="Days to go" value={`${Math.max(0, total - day)}`} />
                </View>
              </View>
            </Card>

            <Card>
              <SectionLabel>This week</SectionLabel>
              <View style={styles.weekRow}>
                {weekDays.map((d) => {
                  const state = summary.dayStates[d - 1];
                  const isToday = d === day;
                  return (
                    <View key={d} style={styles.weekCell}>
                      <View
                        style={[
                          styles.weekDot,
                          state === "done" && styles.weekDotDone,
                          state === "missed" && styles.weekDotMissed,
                          isToday && styles.weekDotToday,
                        ]}
                      >
                        <Text style={[styles.weekDotText, state === "done" && { color: "#06210F" }]}>
                          {state === "done" ? "✓" : ""}
                        </Text>
                      </View>
                      <Text style={[styles.weekLabel, isToday && { color: COLORS.gold }]}>{d}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {weightToday !== undefined || photoUri ? (
              <Card>
                <SectionLabel>Logged today</SectionLabel>
                <View style={styles.loggedRow}>
                  {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}
                  {weightToday !== undefined ? (
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.weightValue}>{formatWeight(weightToday)} lbs</Text>
                      <Text style={styles.weightSub}>
                        {weightChange === null
                          ? "Your first weigh-in"
                          : weightChange === 0
                            ? "Same as your start"
                            : `${weightChange > 0 ? "+" : "−"}${formatWeight(Math.abs(weightChange))} lbs since day ${series[0].day}`}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Card>
            ) : null}

            {isFinal ? (
              <>
                <PrimaryButton label="View my recap" tone="green" onPress={onViewRecap} />
                <GhostButton label="Close" onPress={onClose} />
              </>
            ) : (
              <>
                <PrimaryButton label="Keep going" tone="green" onPress={onClose} />
                <Text style={styles.tomorrow}>Tomorrow is day {day + 1}.</Text>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 300 },
  heroInner: { flex: 1, justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  eyebrow: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700", letterSpacing: 1.2, marginTop: SPACING.md },
  headline: { color: "#fff", fontFamily: FONTS.display, fontSize: 64, lineHeight: 68 },
  message: { color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 21, marginTop: 4, maxWidth: 320 },
  body: { padding: SPACING.lg, gap: SPACING.md, marginTop: -SPACING.md },
  progressRow: { flexDirection: "row", alignItems: "center", gap: SPACING.lg },
  ringValue: { color: COLORS.text, fontFamily: FONTS.display, fontSize: 30 },
  ringTotal: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", marginTop: -2 },
  stats: { flex: 1, gap: SPACING.sm },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statIcon: { fontSize: 14, width: 18 },
  statLabel: { flex: 1, color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  statValue: { color: COLORS.text, fontSize: 15, fontWeight: "800" },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  weekCell: { alignItems: "center", gap: 6, flex: 1 },
  weekDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDotDone: { backgroundColor: COLORS.accent },
  weekDotMissed: { backgroundColor: COLORS.redSoft },
  weekDotToday: { borderWidth: 2, borderColor: COLORS.gold },
  weekDotText: { fontSize: 14, fontWeight: "900", color: COLORS.textFaint },
  weekLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: "700" },
  loggedRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  photo: { width: 72, height: 72, borderRadius: RADIUS.md },
  weightValue: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  weightSub: { color: COLORS.textMuted, fontSize: 12 },
  tomorrow: {
    color: COLORS.textFaint,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
