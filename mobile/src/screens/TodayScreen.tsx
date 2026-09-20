import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Screen, Card, PrimaryButton, GhostButton, SectionLabel } from "../components/ui";
import { CommitmentRow } from "../components/CommitmentRow";
import { ProgressRing } from "../components/ProgressRing";
import { HeroBackground } from "../components/HeroBackground";
import { WeeklyMissionCard, WeeklyMissionModal } from "./WeeklyMissionScreen";
import { RecapModal } from "./RecapScreen";
import { DayCompleteModal } from "./DayCompleteScreen";
import { WeightCard } from "../components/WeightCard";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import { useChallengeStore } from "../store/challengeStore";
import { useLogStore } from "../store/logStore";
import { useGroupStore } from "../store/groupStore";
import { commitmentMet, currentDayNumber, dayComplete, summarize } from "../utils/challenge";
import { weeklyMission } from "../utils/weeklyMission";
import { todayISO } from "../utils/date";

export default function TodayScreen() {
  const challenge = useChallengeStore((s) => s.challenge);
  const restart = useChallengeStore((s) => s.restart);
  const logs = useLogStore((s) => s.logs);
  const setEntry = useLogStore((s) => s.setEntry);
  const setNote = useLogStore((s) => s.setNote);
  const setWeight = useLogStore((s) => s.setWeight);
  const lockDay = useLogStore((s) => s.lockDay);
  const unlockDay = useLogStore((s) => s.unlockDay);
  const syncStats = useGroupStore((s) => s.syncStats);
  const inGroup = useGroupStore((s) => !!s.groupId);

  const [missionOpen, setMissionOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const [dayCompleteOpen, setDayCompleteOpen] = useState(false);
  const autoShownFor = useRef<string | null>(null);

  const date = todayISO();
  const dayNumber = challenge ? currentDayNumber(challenge, date) : 1;
  const summary = challenge ? summarize(challenge, logs, date) : null;

  useEffect(() => {
    if (challenge && summary?.finished && autoShownFor.current !== challenge.id) {
      autoShownFor.current = challenge.id;
      setRecapOpen(true);
    }
  }, [challenge, summary?.finished]);

  if (!challenge || !summary) return null;

  const todayLog = logs[date];
  const allDone = dayComplete(challenge, todayLog);
  const locked = !!todayLog?.lockedAt;
  const total = challenge.commitments.length;
  const doneCount = challenge.commitments.filter((c) => commitmentMet(c, todayLog?.entries[c.id])).length;
  const mission = weeklyMission(challenge, logs, dayNumber);

  const clampedDay = Math.min(Math.max(dayNumber, 1), challenge.totalDays);
  const footerMsg = locked ? "Nice work." : allDone ? "Ready to lock in." : "Keep going.";

  const pushGroupStats = () => {
    if (!inGroup) return;
    syncStats({
      dayNumber: clampedDay,
      totalDays: challenge.totalDays,
      streak: summary.currentStreak,
      challengeName: challenge.name,
    });
  };

  return (
    <Screen>
      {summary.finished ? (
        <Card>
          <Text style={styles.doneTitle}>🏆 You finished all {challenge.totalDays} days.</Text>
          <Text style={styles.bannerBody}>
            {summary.completedDays} of {challenge.totalDays} days fully completed.
          </Text>
          <PrimaryButton label="View recap" tone="green" onPress={() => setRecapOpen(true)} />
          <GhostButton label="Start a new 90" onPress={restart} />
        </Card>
      ) : (
        <>
          <HeroBackground variant="card" radius={RADIUS.lg} style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={{ gap: 2 }}>
                <Text style={styles.heroLabel}>{challenge.name.toUpperCase()}</Text>
                <Text style={styles.heroDay}>
                  {clampedDay}
                  <Text style={styles.heroTotal}>/{challenge.totalDays}</Text>
                </Text>
                {summary.currentStreak > 0 && (
                  <Text style={styles.heroStreak}>🔥 {summary.currentStreak} day streak</Text>
                )}
              </View>
              <ProgressRing progress={total ? doneCount / total : 0} size={88} strokeWidth={8}>
                <Text style={styles.ringValue}>{doneCount}</Text>
                <Text style={styles.ringTotal}>/{total}</Text>
              </ProgressRing>
            </View>
          </HeroBackground>

          <View style={styles.statRow}>
            <Stat
              label={challenge.missRule === "grace" ? "Grace left" : "Best streak"}
              value={challenge.missRule === "grace" ? `${summary.graceRemaining ?? 0}` : `${summary.longestStreak}`}
            />
            <Stat label="Days done" value={`${summary.completedDays}/${challenge.totalDays}`} />
          </View>

          <WeeklyMissionCard mission={mission} onPress={() => setMissionOpen(true)} />

          {summary.failed && challenge.missRule === "grace" && (
            <Card style={{ borderColor: COLORS.red, borderWidth: 1 }}>
              <Text style={styles.bannerTitle}>Out of grace days</Text>
              <Text style={styles.bannerBody}>
                You've used more skip days than allowed. Restart to reset the count.
              </Text>
              <PrimaryButton label="Restart at day 1" tone="red" onPress={restart} />
            </Card>
          )}

          <SectionLabel>Today</SectionLabel>
          {challenge.commitments.length === 0 ? (
            <Card>
              <Text style={styles.bannerBody}>
                No commitments yet. Add some in the Challenge tab.
              </Text>
            </Card>
          ) : (
            challenge.commitments.map((c) => (
              <CommitmentRow
                key={c.id}
                commitment={c}
                value={todayLog?.entries[c.id]}
                onChange={(v) => setEntry(date, dayNumber, c.id, v)}
              />
            ))
          )}

          <WeightCard weight={todayLog?.weight} onSave={(w) => setWeight(date, dayNumber, w)} />

          <View style={{ gap: SPACING.sm, marginTop: SPACING.sm }}>
            <SectionLabel>Note</SectionLabel>
            <TextInput
              value={todayLog?.note ?? ""}
              onChangeText={(t) => setNote(date, dayNumber, t)}
              placeholder="How did today go?"
              placeholderTextColor={COLORS.textFaint}
              multiline
              style={styles.note}
            />
          </View>

          {locked ? (
            <Card>
              <Text style={styles.doneTitle}>✓ Day {clampedDay} locked in</Text>
              <GhostButton
                label="Unlock"
                onPress={() => {
                  unlockDay(date);
                  pushGroupStats();
                }}
              />
            </Card>
          ) : (
            <PrimaryButton
              label={allDone ? `Lock in day ${clampedDay}` : "Finish every commitment to lock in"}
              tone="green"
              disabled={!allDone}
              onPress={() => {
                lockDay(date, dayNumber);
                pushGroupStats();
                setDayCompleteOpen(true);
              }}
            />
          )}

          <Text style={styles.footer}>{footerMsg}</Text>
        </>
      )}

      <WeeklyMissionModal visible={missionOpen} mission={mission} onClose={() => setMissionOpen(false)} />
      <DayCompleteModal
        visible={dayCompleteOpen}
        challenge={challenge}
        summary={summary}
        logs={logs}
        date={date}
        day={clampedDay}
        onClose={() => setDayCompleteOpen(false)}
        onViewRecap={() => {
          setDayCompleteOpen(false);
          // Let this modal finish dismissing before presenting the next one (iOS is picky).
          setTimeout(() => setRecapOpen(true), 400);
        }}
      />
      <RecapModal
        visible={recapOpen}
        challenge={challenge}
        summary={summary}
        onClose={() => setRecapOpen(false)}
        onRestart={() => {
          setRecapOpen(false);
          restart();
        }}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { padding: SPACING.lg, minHeight: 210, justifyContent: "center" },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroDay: {
    color: "#fff",
    fontFamily: FONTS.display,
    fontSize: 48,
    lineHeight: 50,
  },
  heroTotal: { color: "rgba(255,255,255,0.65)", fontSize: 22 },
  heroStreak: { color: COLORS.gold, fontSize: 13, fontWeight: "700", marginTop: 4 },
  ringValue: { color: "#fff", fontFamily: FONTS.display, fontSize: 26 },
  ringTotal: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "600", marginTop: -2 },
  statRow: { flexDirection: "row", gap: SPACING.sm },
  stat: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
    gap: 2,
  },
  statValue: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  statLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  bannerTitle: { color: COLORS.red, fontSize: 16, fontWeight: "800" },
  bannerBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19 },
  doneTitle: { color: COLORS.accent, fontSize: 16, fontWeight: "800" },
  note: {
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 60,
    fontSize: 14,
    textAlignVertical: "top",
  },
  footer: {
    color: COLORS.textFaint,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: SPACING.sm,
  },
});
