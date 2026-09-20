import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";

const TIMER_OPTIONS = [0, 3, 5, 10] as const;

// Remembered for the rest of the session so you don't re-pick your timer every day.
let lastTimer: number = 5;

/**
 * In-app camera with a self-timer, so you can set the phone down, pose, and let it take the photo.
 * After the shot you review it and choose "Use photo" or "Retake".
 */
export function CameraCaptureModal({
  visible,
  onClose,
  onCaptured,
}: {
  visible: boolean;
  onClose: () => void;
  onCaptured: (uri: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [facing, setFacing] = useState<"front" | "back">("front");
  const [timer, setTimer] = useState<number>(lastTimer);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fresh state every time the camera opens.
  useEffect(() => {
    if (visible) {
      setShot(null);
      setCountdown(null);
      setError(null);
      setReady(false);
    }
  }, [visible]);

  // Tick the countdown down once a second; take the photo when it reaches zero.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      takeNow();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const takeNow = async () => {
    try {
      setFlash(true);
      setTimeout(() => setFlash(false), 140);
      const pic = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (pic?.uri) setShot(pic.uri);
      else setError("The camera didn't return a photo. Try again.");
    } catch {
      setError("Couldn't take the photo. Try again.");
    }
  };

  const pickTimer = (s: number) => {
    lastTimer = s;
    setTimer(s);
  };

  const start = () => {
    setError(null);
    if (timer === 0) takeNow();
    else setCountdown(timer);
  };

  const close = () => {
    setCountdown(null);
    onClose();
  };

  const usePhoto = () => {
    if (shot) onCaptured(shot);
    close();
  };

  // --- permission gate ---
  if (visible && !permission) {
    return (
      <Modal visible animationType="slide" onRequestClose={close}>
        <View style={[styles.screen, styles.center]}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      </Modal>
    );
  }

  if (visible && permission && !permission.granted) {
    return (
      <Modal visible animationType="slide" onRequestClose={close}>
        <SafeAreaView style={[styles.screen, styles.center, { padding: SPACING.xl, gap: SPACING.md }]}>
          <Text style={styles.permTitle}>Camera access needed</Text>
          <Text style={styles.permBody}>
            Project 90 uses your camera to take progress photos, including hands-free with the timer.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Allow camera</Text>
          </Pressable>
          <Pressable onPress={close} hitSlop={12}>
            <Text style={styles.link}>Cancel</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={styles.screen}>
        {shot ? (
          <>
            <Image source={{ uri: shot }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <SafeAreaView style={styles.reviewBar} edges={["bottom"]}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  setShot(null);
                  setReady(false);
                }}
              >
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, { flex: 1 }]} onPress={usePhoto}>
                <Text style={styles.primaryBtnText}>Use photo</Text>
              </Pressable>
            </SafeAreaView>
          </>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              mirror={facing === "front"}
              onCameraReady={() => setReady(true)}
              onMountError={() => setError("The camera couldn't start on this device.")}
            />

            <SafeAreaView style={styles.topBar} edges={["top"]}>
              <Pressable onPress={close} hitSlop={12} style={styles.roundBtn}>
                <Text style={styles.roundBtnText}>✕</Text>
              </Pressable>
              <Pressable
                onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
                hitSlop={12}
                style={styles.roundBtn}
                disabled={countdown !== null}
              >
                <Text style={styles.roundBtnText}>⟲</Text>
              </Pressable>
            </SafeAreaView>

            {countdown !== null && countdown > 0 ? (
              <View style={styles.countdownWrap} pointerEvents="none">
                <Text style={styles.countdown}>{countdown}</Text>
                <Text style={styles.countdownHint}>Get in position</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorWrap} pointerEvents="none">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
              <View style={styles.timerRow}>
                <Text style={styles.timerLabel}>Timer</Text>
                {TIMER_OPTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => pickTimer(s)}
                    disabled={countdown !== null}
                    style={[styles.timerChip, timer === s && styles.timerChipActive]}
                  >
                    <Text style={[styles.timerChipText, timer === s && styles.timerChipTextActive]}>
                      {s === 0 ? "Off" : `${s}s`}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {countdown !== null ? (
                <Pressable style={styles.cancelBtn} onPress={() => setCountdown(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.shutterOuter, !ready && { opacity: 0.4 }]}
                  onPress={start}
                  disabled={!ready}
                >
                  <View style={styles.shutterInner} />
                </Pressable>
              )}
              <Text style={styles.shutterHint}>
                {countdown !== null ? "Photo coming up…" : timer === 0 ? "Tap to take photo" : `Tap to start the ${timer}s timer`}
              </Text>
            </SafeAreaView>

            {flash ? <View style={styles.flash} pointerEvents="none" /> : null}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  center: { alignItems: "center", justifyContent: "center" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  roundBtnText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  countdownWrap: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  countdown: {
    color: "#fff",
    fontFamily: FONTS.display,
    fontSize: 180,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 16,
  },
  countdownHint: { color: "#fff", fontSize: 16, fontWeight: "700", textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 8 },
  errorWrap: { position: "absolute", top: "40%", left: SPACING.xl, right: SPACING.xl, alignItems: "center" },
  errorText: {
    color: "#fff",
    backgroundColor: "rgba(229,72,77,0.9)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  timerRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  timerLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "700", marginRight: 4 },
  timerChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  timerChipActive: { backgroundColor: COLORS.accent },
  timerChipText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  timerChipTextActive: { color: "#06210F" },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff" },
  cancelBtn: {
    paddingHorizontal: SPACING.xl,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  shutterHint: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  flash: { ...StyleSheet.absoluteFill, backgroundColor: "#fff", opacity: 0.85 },
  reviewBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
  },
  primaryBtnText: { color: "#06210F", fontSize: 16, fontWeight: "800" },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  permTitle: { color: COLORS.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  permBody: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  link: { color: COLORS.textMuted, fontSize: 15, fontWeight: "600" },
});
