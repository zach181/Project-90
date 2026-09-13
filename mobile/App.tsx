import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Anton_400Regular } from "@expo-google-fonts/anton";

import { COLORS, RADIUS, SPACING } from "./src/constants/theme";
import { useChallengeStore } from "./src/store/challengeStore";
import { useLogStore } from "./src/store/logStore";
import { useProfileStore } from "./src/store/profileStore";
import { useGroupStore } from "./src/store/groupStore";
import { summarize } from "./src/utils/challenge";
import { TopBar } from "./src/components/TopBar";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import TodayScreen from "./src/screens/TodayScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import PhotosScreen from "./src/screens/PhotosScreen";
import ChallengeScreen from "./src/screens/ChallengeScreen";
import GroupsScreen from "./src/screens/GroupsScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Today: "📅",
  Progress: "📊",
  Photos: "📸",
  Groups: "👥",
  Challenge: "⚙️",
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.background,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.accent,
  },
};

function Header({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const challenge = useChallengeStore((s) => s.challenge);
  const logs = useLogStore((s) => s.logs);
  const goToSettings = () => navigation.navigate("Challenge");
  if (!challenge) return <TopBar onSettingsPress={goToSettings} />;
  const summary = summarize(challenge, logs);
  const day = Math.min(Math.max(summary.dayNumber, 1), summary.totalDays);
  return (
    <TopBar
      dayLabel={`Day ${day}/${summary.totalDays}`}
      streak={summary.currentStreak}
      onSettingsPress={goToSettings}
    />
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Anton_400Regular });

  const challenge = useChallengeStore((s) => s.challenge);
  const challengeHydrated = useChallengeStore((s) => s.hydrated);
  const restart = useChallengeStore((s) => s.restart);
  const logs = useLogStore((s) => s.logs);
  const logsHydrated = useLogStore((s) => s.hydrated);
  const profileHydrated = useProfileStore((s) => s.hydrated);
  const groupHydrated = useGroupStore((s) => s.hydrated);

  const [autoResetDay, setAutoResetDay] = useState<number | null>(null);

  // Strict mode: if a past day ended with unfinished commitments, reset to day 1.
  useEffect(() => {
    if (!challengeHydrated || !logsHydrated) return;
    if (!challenge || challenge.missRule !== "reset") return;
    const missed = summarize(challenge, logs).missedDays;
    if (missed.length > 0) {
      setAutoResetDay(missed[0]);
      restart();
    }
  }, [challengeHydrated, logsHydrated, challenge, logs, restart]);

  const ready = fontsLoaded && challengeHydrated && logsHydrated && profileHydrated && groupHydrated;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : !challenge ? (
        <OnboardingScreen />
      ) : (
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={({ route, navigation }) => ({
              headerShown: true,
              header: () => <Header navigation={navigation} />,
              tabBarActiveTintColor: COLORS.accent,
              tabBarInactiveTintColor: COLORS.textFaint,
              tabBarStyle: { backgroundColor: COLORS.background, borderTopColor: COLORS.border },
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
            })}
          >
            <Tab.Screen name="Today" component={TodayScreen} />
            <Tab.Screen name="Progress" component={ProgressScreen} />
            <Tab.Screen name="Photos" component={PhotosScreen} />
            <Tab.Screen name="Groups" component={GroupsScreen} />
            <Tab.Screen name="Challenge" component={ChallengeScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      )}

      <Modal
        visible={autoResetDay !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAutoResetDay(null)}
      >
        <View style={styles.noticeBackdrop}>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Back to day 1</Text>
            <Text style={styles.noticeBody}>
              Day {autoResetDay} ended with unfinished commitments. In strict mode that
              resets the challenge, so you're starting over from day 1.
            </Text>
            <Pressable style={styles.noticeBtn} onPress={() => setAutoResetDay(null)}>
              <Text style={styles.noticeBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  noticeCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.red,
    padding: SPACING.lg,
    gap: SPACING.md,
    width: "100%",
    maxWidth: 380,
  },
  noticeTitle: { color: COLORS.red, fontSize: 18, fontWeight: "800" },
  noticeBody: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  noticeBtn: {
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  noticeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
