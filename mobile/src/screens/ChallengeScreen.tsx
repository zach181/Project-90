import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import {
  Screen,
  ScreenHeader,
  Card,
  SectionLabel,
  Segmented,
  PrimaryButton,
  GhostButton,
  Stepper,
} from "../components/ui";
import { CommitmentEditorModal } from "../components/CommitmentEditorModal";
import { SUGGESTED_COMMITMENTS } from "../constants/suggestions";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { useChallengeStore } from "../store/challengeStore";
import type { Commitment, MissRule } from "../types";
import { prettyDate } from "../utils/date";

const RULE_OPTIONS: Array<{ value: MissRule; label: string }> = [
  { value: "reset", label: "Reset" },
  { value: "grace", label: "Grace" },
  { value: "streak-only", label: "Streak" },
];

const RULE_HELP: Record<MissRule, string> = {
  reset: "Strict mode. Miss any commitment on any day and you restart at day 1.",
  grace: "You get a set number of skip days across the whole challenge before it resets.",
  "streak-only": "It never resets. You just track your streak and overall consistency.",
};

export default function ChallengeScreen() {
  const challenge = useChallengeStore((s) => s.challenge);
  const updateChallenge = useChallengeStore((s) => s.updateChallenge);
  const addCommitment = useChallengeStore((s) => s.addCommitment);
  const updateCommitment = useChallengeStore((s) => s.updateCommitment);
  const removeCommitment = useChallengeStore((s) => s.removeCommitment);
  const restart = useChallengeStore((s) => s.restart);
  const deleteChallenge = useChallengeStore((s) => s.deleteChallenge);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Commitment | null>(null);

  if (!challenge) return null;

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (c: Commitment) => {
    setEditing(c);
    setEditorOpen(true);
  };

  const confirmRestart = () =>
    Alert.alert("Restart challenge?", "Keeps your commitments but wipes all progress and starts today at day 1.", [
      { text: "Cancel", style: "cancel" },
      { text: "Restart", style: "destructive", onPress: restart },
    ]);

  const confirmDelete = () =>
    Alert.alert("Delete challenge?", "This removes the challenge and all logged days.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteChallenge },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Challenge" subtitle={`Started ${prettyDate(challenge.startDate)}`} />

      <Card>
        <SectionLabel>Name</SectionLabel>
        <TextInput
          value={challenge.name}
          onChangeText={(t) => updateChallenge({ name: t })}
          style={styles.input}
          placeholderTextColor={COLORS.textFaint}
        />
      </Card>

      <Card>
        <SectionLabel>Miss rule</SectionLabel>
        <Segmented
          options={RULE_OPTIONS}
          value={challenge.missRule}
          onChange={(v) => updateChallenge({ missRule: v })}
        />
        <Text style={styles.help}>{RULE_HELP[challenge.missRule]}</Text>
        {challenge.missRule === "grace" && (
          <View style={styles.graceRow}>
            <Text style={styles.graceLabel}>Grace days allowed</Text>
            <View style={styles.graceControl}>
              <Text style={styles.graceValue}>{challenge.graceDays}</Text>
              <Stepper
                disabledDecrement={challenge.graceDays <= 0}
                onDecrement={() => updateChallenge({ graceDays: Math.max(0, challenge.graceDays - 1) })}
                onIncrement={() => updateChallenge({ graceDays: challenge.graceDays + 1 })}
              />
            </View>
          </View>
        )}
      </Card>

      <SectionLabel>Commitments ({challenge.commitments.length})</SectionLabel>
      {challenge.commitments.map((c) => (
        <Pressable key={c.id} style={styles.cmtRow} onPress={() => openEdit(c)}>
          <Text style={styles.cmtIcon}>{c.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cmtTitle}>{c.title}</Text>
            <Text style={styles.cmtMeta}>{describeCommitment(c)}</Text>
          </View>
          <Text style={styles.editHint}>Edit</Text>
        </Pressable>
      ))}
      <PrimaryButton label="Add commitment" onPress={openNew} />

      {(() => {
        const available = SUGGESTED_COMMITMENTS.filter(
          (s) => !challenge.commitments.some((c) => c.title.toLowerCase() === s.title.toLowerCase())
        );
        if (available.length === 0) return null;
        return (
          <View style={{ gap: SPACING.sm, marginTop: SPACING.sm }}>
            <SectionLabel>Quick add — optional</SectionLabel>
            <View style={styles.chipWrap}>
              {available.map((s) => (
                <Pressable key={s.title} style={styles.chip} onPress={() => addCommitment(s)}>
                  <Text style={styles.chipText}>
                    +  {s.icon}  {s.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })()}

      <View style={{ height: SPACING.lg }} />
      <SectionLabel>Danger zone</SectionLabel>
      <Card style={{ borderColor: COLORS.red, borderWidth: 1 }}>
        <GhostButton label="Restart at day 1" tone="red" onPress={confirmRestart} />
        <View style={styles.divider} />
        <GhostButton label="Delete challenge" tone="red" onPress={confirmDelete} />
      </Card>

      <CommitmentEditorModal
        visible={editorOpen}
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSave={(data) => {
          if (editing) updateCommitment(editing.id, data);
          else addCommitment(data);
          setEditorOpen(false);
        }}
        onDelete={
          editing
            ? () => {
                removeCommitment(editing.id);
                setEditorOpen(false);
              }
            : undefined
        }
      />
    </Screen>
  );
}

function describeCommitment(c: Commitment): string {
  switch (c.type) {
    case "quantity":
      return `${c.target} ${c.unit} · step ${c.step}`;
    case "duration":
      return `${c.targetMinutes} minutes`;
    case "check":
      return "Yes / no";
    case "photo":
      return "Progress photo";
    case "text":
      return c.hint ? `Writing · "${c.hint}"` : "Writing";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  input: {
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 15,
  },
  help: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  graceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  graceLabel: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  graceControl: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  graceValue: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  cmtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  cmtIcon: { fontSize: 22 },
  cmtTitle: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  cmtMeta: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  editHint: { color: COLORS.accent, fontSize: 13, fontWeight: "700" },
  divider: { height: 1, backgroundColor: COLORS.border },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  chip: {
    backgroundColor: COLORS.chip,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  chipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
});
