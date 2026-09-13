import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeroBackground } from "../components/HeroBackground";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { TEMPLATES } from "../constants/templates";
import { useChallengeStore } from "../store/challengeStore";

const RULE_LABEL: Record<string, string> = {
  reset: "Miss a day → restart at day 1",
  grace: "A few grace days allowed",
  "streak-only": "Never resets — tracks consistency",
};

export default function OnboardingScreen() {
  const createChallenge = useChallengeStore((s) => s.createChallenge);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <HeroBackground variant="banner" style={styles.hero}>
          <SafeAreaView edges={["top"]}>
            <View style={styles.heroContent}>
              <Text style={styles.wordmark}>Project 90</Text>
              <Text style={styles.tagline}>
                90 days. Your rules. Pick a starting point — you can tweak everything after.
              </Text>
            </View>
          </SafeAreaView>
        </HeroBackground>

        <View style={styles.body}>
          {TEMPLATES.map((t) => (
            <Pressable
              key={t.key}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => createChallenge(t.input)}
            >
              <Text style={styles.cardTitle}>{t.title}</Text>
              <Text style={styles.cardBlurb}>{t.blurb}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaPill}>{t.input.commitments.length} commitments</Text>
                <Text style={styles.metaPill}>{RULE_LABEL[t.input.missRule]}</Text>
              </View>
              <View style={styles.iconStrip}>
                {t.input.commitments.map((c, i) => (
                  <Text key={i} style={styles.stripIcon}>
                    {c.icon}
                  </Text>
                ))}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: SPACING.xl * 2 },
  hero: { height: 300 },
  heroContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, gap: 8 },
  wordmark: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  tagline: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 20, maxWidth: 320 },
  body: { padding: SPACING.lg, gap: SPACING.md, marginTop: -SPACING.lg },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  cardTitle: { color: COLORS.text, fontSize: 19, fontWeight: "800" },
  cardBlurb: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginTop: SPACING.xs },
  metaPill: {
    color: COLORS.textFaint,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: COLORS.chip,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
  },
  iconStrip: { flexDirection: "row", gap: SPACING.xs, marginTop: SPACING.xs },
  stripIcon: { fontSize: 18 },
});
