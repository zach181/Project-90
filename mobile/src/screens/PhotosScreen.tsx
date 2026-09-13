import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Modal } from "react-native";
import { Screen, ScreenHeader, Card } from "../components/ui";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { useChallengeStore } from "../store/challengeStore";
import { useLogStore } from "../store/logStore";
import { dateForDay } from "../utils/challenge";
import { prettyDate } from "../utils/date";

interface Shot {
  day: number;
  date: string;
  uri: string;
  title: string;
}

export default function PhotosScreen() {
  const challenge = useChallengeStore((s) => s.challenge);
  const logs = useLogStore((s) => s.logs);
  const [active, setActive] = useState<Shot | null>(null);

  const shots = useMemo<Shot[]>(() => {
    if (!challenge) return [];
    const photoCommitments = challenge.commitments.filter((c) => c.type === "photo");
    if (photoCommitments.length === 0) return [];
    const out: Shot[] = [];
    for (let d = 1; d <= challenge.totalDays; d++) {
      const date = dateForDay(challenge, d);
      const log = logs[date];
      if (!log) continue;
      for (const c of photoCommitments) {
        const v = log.entries[c.id];
        if (v?.kind === "photo" && v.uri) {
          out.push({ day: d, date, uri: v.uri, title: c.title });
        }
      }
    }
    return out;
  }, [challenge, logs]);

  if (!challenge) return null;

  return (
    <Screen>
      <ScreenHeader title="Photos" subtitle={`${shots.length} progress ${shots.length === 1 ? "photo" : "photos"}`} />

      {shots.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            {challenge.commitments.some((c) => c.type === "photo")
              ? "Add a progress photo on the Today tab and it'll show up here."
              : "This challenge has no photo commitment. Add one in the Challenge tab."}
          </Text>
        </Card>
      ) : (
        <View style={styles.grid}>
          {shots.map((s) => (
            <Pressable key={`${s.day}-${s.title}`} style={styles.item} onPress={() => setActive(s)}>
              <Image source={{ uri: s.uri }} style={styles.thumb} />
              <Text style={styles.dayTag}>Day {s.day}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Modal visible={!!active} transparent animationType="fade" onRequestClose={() => setActive(null)}>
        <Pressable style={styles.backdrop} onPress={() => setActive(null)}>
          {active ? (
            <View style={styles.viewer}>
              <Image source={{ uri: active.uri }} style={styles.full} resizeMode="contain" />
              <Text style={styles.viewerText}>
                Day {active.day} · {prettyDate(active.date)} · {active.title}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  item: { width: "31%", aspectRatio: 0.8, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surface },
  thumb: { width: "100%", height: "100%" },
  dayTag: {
    position: "absolute",
    left: 6,
    bottom: 6,
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  empty: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  viewer: { width: "100%", alignItems: "center", gap: SPACING.md },
  full: { width: "100%", height: "80%" },
  viewerText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
