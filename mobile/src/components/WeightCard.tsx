import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Card, SectionLabel } from "./ui";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { MAX_WEIGHT, MIN_WEIGHT, formatWeight, parseWeight } from "../utils/weight";

/** Optional daily weigh-in. Lives outside the commitments, so it never blocks locking in a day. */
export function WeightCard({
  weight,
  onSave,
}: {
  weight: number | undefined;
  onSave: (w: number | null) => void;
}) {
  const [text, setText] = useState(weight !== undefined ? formatWeight(weight) : "");
  const [error, setError] = useState<string | null>(null);

  // Follow the stored value (e.g. after a restart clears the logs).
  useEffect(() => {
    setText(weight !== undefined ? formatWeight(weight) : "");
    setError(null);
  }, [weight]);

  const logged = weight !== undefined;
  const unchanged = logged && parseWeight(text) === weight;

  const save = () => {
    const parsed = parseWeight(text);
    if (parsed === null) {
      setError(`Enter a weight between ${MIN_WEIGHT} and ${MAX_WEIGHT} lbs.`);
      return;
    }
    setError(null);
    onSave(parsed);
  };

  return (
    <Card>
      <View style={styles.header}>
        <SectionLabel>Weight (optional)</SectionLabel>
        {logged ? <Text style={styles.logged}>Logged ✓</Text> : null}
      </View>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            setError(null);
          }}
          onSubmitEditing={save}
          keyboardType="decimal-pad"
          returnKeyType="done"
          placeholder="Today's weight"
          placeholderTextColor={COLORS.textFaint}
          style={styles.input}
        />
        <Text style={styles.unit}>lbs</Text>
        <Pressable
          style={[styles.saveBtn, (unchanged || !text.trim()) && { opacity: 0.4 }]}
          onPress={save}
          disabled={unchanged || !text.trim()}
        >
          <Text style={styles.saveBtnText}>{logged ? "Update" : "Save"}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {logged ? (
        <Pressable onPress={() => onSave(null)} hitSlop={8}>
          <Text style={styles.clear}>Remove today's weight</Text>
        </Pressable>
      ) : (
        <Text style={styles.hint}>Skip it any day — your graph on the Progress tab fills in as you log.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logged: { color: COLORS.accent, fontSize: 12, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  input: {
    flex: 1,
    minWidth: 0, // let the field shrink so the Save button stays inside the card
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "700",
  },
  unit: { color: COLORS.textMuted, fontSize: 14, fontWeight: "700" },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  saveBtnText: { color: "#06210F", fontWeight: "800", fontSize: 14 },
  error: { color: COLORS.red, fontSize: 12 },
  hint: { color: COLORS.textFaint, fontSize: 12, lineHeight: 17 },
  clear: { color: COLORS.textFaint, fontSize: 12, fontWeight: "600" },
});
