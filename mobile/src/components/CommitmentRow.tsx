import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import type { Commitment, EntryValue } from "../types";
import { commitmentMet, commitmentProgress } from "../utils/challenge";
import { persistPhoto } from "../utils/photos";
import { Stepper } from "./ui";
import { CameraCaptureModal } from "./CameraCaptureModal";

export function CommitmentRow({
  commitment,
  value,
  onChange,
}: {
  commitment: Commitment;
  value: EntryValue | undefined;
  onChange: (v: EntryValue | null) => void;
}) {
  const met = commitmentMet(commitment, value);
  const pct = commitmentProgress(commitment, value);
  const isCheck = commitment.type === "check";

  const toggleCheck = () => {
    const done = value?.kind === "check" && value.done;
    const note = value?.kind === "check" ? value.note : undefined;
    onChange(done ? (note ? { kind: "check", done: false, note } : null) : { kind: "check", done: true, note });
  };

  return (
    <View style={styles.row}>
      <Pressable style={styles.rowTop} onPress={isCheck ? toggleCheck : undefined} disabled={!isCheck}>
        <Text style={styles.icon}>{commitment.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{commitment.title}</Text>
          <Text style={styles.sub}>{describe(commitment, value)}</Text>
        </View>
        <View style={[styles.dot, met && styles.dotMet]}>
          {met ? <Text style={styles.dotCheck}>✓</Text> : null}
        </View>
      </Pressable>

      {isCheck && commitment.allowNote ? (
        <View style={styles.control}>
          <TextInput
            value={value?.kind === "check" ? value.note ?? "" : ""}
            onChangeText={(t) => {
              const done = value?.kind === "check" && value.done;
              onChange(done || t.length ? { kind: "check", done: !!done, note: t.length ? t : undefined } : null);
            }}
            placeholder={commitment.hint ?? "Add a note (optional)"}
            placeholderTextColor={COLORS.textFaint}
            multiline
            style={styles.textInput}
          />
        </View>
      ) : null}

      {!isCheck ? <View style={styles.control}>{renderControl(commitment, value, onChange)}</View> : null}

      {(commitment.type === "quantity" || commitment.type === "duration") && (
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
      )}
    </View>
  );
}

function describe(c: Commitment, v: EntryValue | undefined): string {
  switch (c.type) {
    case "quantity": {
      const amt = v?.kind === "quantity" ? v.amount : 0;
      return `${amt} / ${c.target ?? 0} ${c.unit ?? ""}`.trim();
    }
    case "duration": {
      const min = v?.kind === "duration" ? v.minutes : 0;
      return `${min} / ${c.targetMinutes ?? 0} min`;
    }
    case "check":
      return c.allowNote ? "Tap to mark done — note optional" : "Tap to mark done";
    case "photo":
      return v?.kind === "photo" && v.uri ? "Photo added" : "No photo yet";
    case "text":
      return c.hint ?? "Write an entry";
    default:
      return "";
  }
}

function renderControl(
  c: Commitment,
  v: EntryValue | undefined,
  onChange: (v: EntryValue | null) => void
) {
  switch (c.type) {
    case "quantity": {
      const amt = v?.kind === "quantity" ? v.amount : 0;
      const step = c.step ?? 1;
      const set = (n: number) =>
        onChange(n <= 0 ? null : { kind: "quantity", amount: Math.round(n) });
      return (
        <View style={{ gap: SPACING.sm }}>
          <View style={styles.quantRow}>
            <Text style={styles.bigValue}>
              {amt}
              <Text style={styles.bigUnit}> {c.unit ?? ""}</Text>
            </Text>
            <Stepper
              disabledDecrement={amt <= 0}
              onDecrement={() => set(Math.max(0, amt - step))}
              onIncrement={() => set(amt + step)}
            />
          </View>
          <QuantityAdd unit={c.unit ?? ""} onAdd={(n) => set(amt + n)} />
        </View>
      );
    }
    case "duration": {
      const min = v?.kind === "duration" ? v.minutes : 0;
      const set = (n: number) =>
        onChange(n <= 0 ? null : { kind: "duration", minutes: n });
      return (
        <View style={styles.quantRow}>
          <Text style={styles.bigValue}>
            {min}
            <Text style={styles.bigUnit}> min</Text>
          </Text>
          <Stepper
            disabledDecrement={min <= 0}
            onDecrement={() => set(Math.max(0, min - 5))}
            onIncrement={() => set(min + 5)}
          />
        </View>
      );
    }
    case "photo":
      return <PhotoControl uri={v?.kind === "photo" ? v.uri : ""} onChange={onChange} />;
    case "text": {
      const text = v?.kind === "text" ? v.text : "";
      return (
        <TextInput
          value={text}
          onChangeText={(t) => onChange(t.length ? { kind: "text", text: t } : null)}
          placeholder={c.hint ?? "Write an entry"}
          placeholderTextColor={COLORS.textFaint}
          multiline
          style={styles.textInput}
        />
      );
    }
    default:
      return null;
  }
}

function QuantityAdd({ unit, onAdd }: { unit: string; onAdd: (n: number) => void }) {
  const [txt, setTxt] = useState("");
  const submit = () => {
    const n = parseInt(txt, 10);
    if (!Number.isNaN(n) && n > 0) onAdd(n);
    setTxt("");
  };
  return (
    <View style={styles.addRow}>
      <TextInput
        value={txt}
        onChangeText={setTxt}
        onSubmitEditing={submit}
        keyboardType="number-pad"
        returnKeyType="done"
        placeholder={`Type ${unit} to add`}
        placeholderTextColor={COLORS.textFaint}
        style={styles.addInput}
      />
      <Pressable style={styles.addBtn} onPress={submit}>
        <Text style={styles.addBtnText}>Add</Text>
      </Pressable>
    </View>
  );
}

/** Photo commitment: take one with the in-app (timer) camera, or upload one from the library. */
function PhotoControl({
  uri,
  onChange,
}: {
  uri: string;
  onChange: (v: EntryValue | null) => void;
}) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const save = async (rawUri: string) => {
    const stored = await persistPhoto(rawUri);
    onChange({ kind: "photo", uri: stored });
  };

  return (
    <View>
      <View style={styles.photoRow}>
        {uri ? <Image source={{ uri }} style={styles.thumb} /> : null}
        <Pressable style={[styles.photoBtn, styles.photoBtnPrimary]} onPress={() => setCameraOpen(true)}>
          <Text style={[styles.photoBtnText, { color: "#06210F" }]}>
            {uri ? "📷 Retake" : "📷 Take photo"}
          </Text>
        </Pressable>
        <Pressable style={styles.photoBtn} onPress={() => pickFromLibrary(save)}>
          <Text style={styles.photoBtnText}>{uri ? "🖼 Upload new" : "🖼 Upload"}</Text>
        </Pressable>
        {uri ? (
          <Pressable style={styles.photoBtn} onPress={() => onChange(null)}>
            <Text style={[styles.photoBtnText, { color: COLORS.red }]}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
      <CameraCaptureModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCaptured={save}
      />
    </View>
  );
}

async function pickFromLibrary(onPicked: (uri: string) => void) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("Permission needed", "Allow photo access to upload a progress picture.");
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.6,
  });
  if (!result.canceled && result.assets[0]) {
    onPicked(result.assets[0].uri);
  }
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  rowTop: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  icon: { fontSize: 22 },
  title: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  sub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dotMet: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dotCheck: { color: "#06210F", fontSize: 14, fontWeight: "900" },
  control: {},
  quantRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bigValue: { color: COLORS.text, fontSize: 24, fontWeight: "800" },
  bigUnit: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
  addRow: { flexDirection: "row", gap: SPACING.sm },
  addInput: {
    flex: 1,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  addBtn: {
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    justifyContent: "center",
  },
  addBtnText: { color: COLORS.accent, fontWeight: "800", fontSize: 13 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, flexWrap: "wrap" },
  thumb: { width: 44, height: 44, borderRadius: RADIUS.sm },
  photoBtn: {
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  photoBtnPrimary: { backgroundColor: COLORS.accent },
  photoBtnText: { color: COLORS.text, fontWeight: "700", fontSize: 13 },
  textInput: {
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    minHeight: 56,
    fontSize: 14,
    textAlignVertical: "top",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  trackFill: { height: "100%", backgroundColor: COLORS.accent, borderRadius: 3 },
});
