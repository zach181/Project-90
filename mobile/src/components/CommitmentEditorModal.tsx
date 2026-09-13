import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { COMMITMENT_ICONS, DEFAULT_ICON_FOR_TYPE } from "../constants/icons";
import type { Commitment, CommitmentType } from "../types";
import { PrimaryButton, GhostButton, Segmented, SectionLabel } from "./ui";

const TYPE_OPTIONS: Array<{ value: CommitmentType; label: string }> = [
  { value: "check", label: "Yes/no" },
  { value: "quantity", label: "Amount" },
  { value: "duration", label: "Minutes" },
  { value: "photo", label: "Photo" },
  { value: "text", label: "Writing" },
];

export function CommitmentEditorModal({
  visible,
  initial,
  onSave,
  onClose,
  onDelete,
}: {
  visible: boolean;
  initial: Commitment | null;
  onSave: (c: Omit<Commitment, "id">) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<string>("✅");
  const [type, setType] = useState<CommitmentType>("check");
  const [target, setTarget] = useState("64");
  const [unit, setUnit] = useState("oz");
  const [step, setStep] = useState("16");
  const [targetMinutes, setTargetMinutes] = useState("30");
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setIcon(initial?.icon ?? "✅");
    setType(initial?.type ?? "check");
    setTarget(String(initial?.target ?? 64));
    setUnit(initial?.unit ?? "oz");
    setStep(String(initial?.step ?? 16));
    setTargetMinutes(String(initial?.targetMinutes ?? 30));
    setHint(initial?.hint ?? "");
  }, [visible, initial]);

  const pickType = (t: CommitmentType) => {
    setType(t);
    if (!initial) setIcon(DEFAULT_ICON_FOR_TYPE[t] ?? "✅");
  };

  const save = () => {
    const base: Omit<Commitment, "id"> = { title: title.trim() || "Untitled", icon, type };
    if (type === "quantity") {
      base.target = Math.max(1, parseInt(target, 10) || 1);
      base.unit = unit.trim() || "units";
      base.step = Math.max(1, parseInt(step, 10) || 1);
    } else if (type === "duration") {
      base.targetMinutes = Math.max(1, parseInt(targetMinutes, 10) || 1);
    } else if (type === "text") {
      base.hint = hint.trim() || undefined;
    }
    onSave(base);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={{ gap: SPACING.lg, padding: SPACING.lg }}>
            <Text style={styles.heading}>
              {initial ? "Edit commitment" : "New commitment"}
            </Text>

            <View style={{ gap: SPACING.sm }}>
              <SectionLabel>Title</SectionLabel>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Drink water"
                placeholderTextColor={COLORS.textFaint}
                style={styles.input}
              />
            </View>

            <View style={{ gap: SPACING.sm }}>
              <SectionLabel>Type</SectionLabel>
              <Segmented options={TYPE_OPTIONS} value={type} onChange={pickType} />
            </View>

            {type === "quantity" && (
              <View style={styles.inlineRow}>
                <Field label="Target" value={target} onChangeText={setTarget} keyboardType="number-pad" />
                <Field label="Unit" value={unit} onChangeText={setUnit} />
                <Field label="Step" value={step} onChangeText={setStep} keyboardType="number-pad" />
              </View>
            )}

            {type === "duration" && (
              <View style={styles.inlineRow}>
                <Field
                  label="Target minutes"
                  value={targetMinutes}
                  onChangeText={setTargetMinutes}
                  keyboardType="number-pad"
                />
              </View>
            )}

            {type === "text" && (
              <View style={{ gap: SPACING.sm }}>
                <SectionLabel>Prompt / hint</SectionLabel>
                <TextInput
                  value={hint}
                  onChangeText={setHint}
                  placeholder="e.g. What did you read?"
                  placeholderTextColor={COLORS.textFaint}
                  style={styles.input}
                />
              </View>
            )}

            <View style={{ gap: SPACING.sm }}>
              <SectionLabel>Icon</SectionLabel>
              <View style={styles.iconGrid}>
                {COMMITMENT_ICONS.map((e) => (
                  <Pressable
                    key={e}
                    onPress={() => setIcon(e)}
                    style={[styles.iconCell, icon === e && styles.iconCellActive]}
                  >
                    <Text style={{ fontSize: 20 }}>{e}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <PrimaryButton label={initial ? "Save changes" : "Add commitment"} onPress={save} />
            {initial && onDelete ? (
              <GhostButton label="Delete commitment" tone="red" onPress={onDelete} />
            ) : null}
            <GhostButton label="Cancel" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "number-pad" | "default";
}) {
  return (
    <View style={{ flex: 1, gap: SPACING.xs }}>
      <SectionLabel>{label}</SectionLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        placeholderTextColor={COLORS.textFaint}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heading: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  input: {
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 15,
  },
  inlineRow: { flexDirection: "row", gap: SPACING.sm },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  iconCell: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCellActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
});
