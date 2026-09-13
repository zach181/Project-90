import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, Share } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Screen,
  ScreenHeader,
  Card,
  SectionLabel,
  Segmented,
  PrimaryButton,
  GhostButton,
} from "../components/ui";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { useProfileStore } from "../store/profileStore";
import { useGroupStore } from "../store/groupStore";
import { useChallengeStore } from "../store/challengeStore";
import { useLogStore } from "../store/logStore";
import { summarize } from "../utils/challenge";
import { todayISO } from "../utils/date";
import type { GroupMember } from "../types";

const AVATAR_COLORS = ["#2ECC71", "#E3B341", "#4C8DFF", "#E5484D", "#B968E3", "#2FB8C4"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function GroupsScreen() {
  const profile = useProfileStore();
  const groupState = useGroupStore();
  const challenge = useChallengeStore((s) => s.challenge);
  const logs = useLogStore((s) => s.logs);

  const [tab, setTab] = useState<"members" | "stats">("members");
  const [nameInput, setNameInput] = useState("");
  const [groupNameInput, setGroupNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");

  const pushMyStats = useCallback(async () => {
    if (!challenge) return;
    const summary = summarize(challenge, logs, todayISO());
    await groupState.syncStats({
      dayNumber: Math.min(summary.dayNumber, challenge.totalDays),
      totalDays: challenge.totalDays,
      streak: summary.currentStreak,
      challengeName: challenge.name,
    });
  }, [challenge, logs, groupState]);

  useFocusEffect(
    useCallback(() => {
      if (groupState.groupId) {
        pushMyStats();
        groupState.refreshGroup();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupState.groupId])
  );

  if (!profile.hydrated || !groupState.hydrated) return null;

  // Step 1: need a display name before doing anything social.
  if (!profile.name) {
    return (
      <Screen>
        <ScreenHeader title="Groups" subtitle="Take on Project 90 with people you know." />
        <Card>
          <SectionLabel>What should we call you?</SectionLabel>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Your name"
            placeholderTextColor={COLORS.textFaint}
            style={styles.input}
          />
          {profile.error ? <Text style={styles.errorText}>{profile.error}</Text> : null}
          <PrimaryButton
            label={profile.loading ? "Saving…" : "Continue"}
            disabled={profile.loading || !nameInput.trim()}
            onPress={() => profile.ensureProfile(nameInput)}
          />
        </Card>
      </Screen>
    );
  }

  // Step 2: not in a group yet — create or join one.
  if (!groupState.group) {
    return (
      <Screen>
        <ScreenHeader title="Groups" subtitle={`Signed in as ${profile.name}`} />
        <Card>
          <SectionLabel>Create a group</SectionLabel>
          <TextInput
            value={groupNameInput}
            onChangeText={setGroupNameInput}
            placeholder="e.g. Project 90 — Hartford"
            placeholderTextColor={COLORS.textFaint}
            style={styles.input}
          />
          <PrimaryButton
            label={groupState.loading ? "Creating…" : "Create group"}
            disabled={groupState.loading || !groupNameInput.trim()}
            onPress={() => groupState.createGroup(groupNameInput)}
          />
        </Card>
        <Card>
          <SectionLabel>Join with a code</SectionLabel>
          <TextInput
            value={codeInput}
            onChangeText={(t) => setCodeInput(t.toUpperCase())}
            placeholder="6-character code"
            placeholderTextColor={COLORS.textFaint}
            autoCapitalize="characters"
            style={styles.input}
          />
          <PrimaryButton
            label={groupState.loading ? "Joining…" : "Join group"}
            tone="green"
            disabled={groupState.loading || codeInput.trim().length < 4}
            onPress={() => groupState.joinGroup(codeInput)}
          />
        </Card>
        {groupState.error ? (
          <Card style={{ borderColor: COLORS.red, borderWidth: 1 }}>
            <Text style={styles.errorText}>{groupState.error}</Text>
          </Card>
        ) : null}
      </Screen>
    );
  }

  const group = groupState.group;
  const members = group.members;
  const combinedDays = members.reduce((sum, m) => sum + (m.stats?.dayNumber ?? 0), 0);
  const longestStreak = members.reduce((max, m) => Math.max(max, m.stats?.streak ?? 0), 0);

  const confirmLeave = () =>
    Alert.alert("Leave group?", `You'll need the code to rejoin "${group.name}".`, [
      { text: "Cancel", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: groupState.leaveGroup },
    ]);

  const shareCode = () => {
    Share.share({
      message: `Join my Project 90 group "${group.name}" — code: ${group.code}`,
    }).catch(() => {});
  };

  return (
    <Screen>
      <ScreenHeader title={group.name} subtitle={`${members.length} member${members.length === 1 ? "" : "s"}`} />

      <Pressable style={styles.codeChip} onPress={shareCode}>
        <Text style={styles.codeChipText}>Invite code: {group.code}   ·   Share</Text>
      </Pressable>

      <Segmented
        options={[
          { value: "members", label: "Members" },
          { value: "stats", label: "Group stats" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "members" ? (
        <Card>
          {members
            .slice()
            .sort((a, b) => (b.stats?.streak ?? 0) - (a.stats?.streak ?? 0))
            .map((m) => (
              <MemberRow key={m.id} member={m} isMe={m.id === profile.userId} totalDays={challenge?.totalDays} />
            ))}
        </Card>
      ) : (
        <>
          <Card style={{ borderColor: COLORS.gold, borderWidth: 1 }}>
            <Text style={styles.milestoneTitle}>🏆 Group milestone</Text>
            <Text style={styles.milestoneBody}>{combinedDays} combined days completed</Text>
          </Card>
          <View style={styles.statRow}>
            <Stat label="Members" value={`${members.length}`} />
            <Stat label="Longest streak" value={`${longestStreak}`} />
          </View>
        </>
      )}

      {groupState.loading && <ActivityIndicator color={COLORS.accent} />}

      <GhostButton label="Leave group" tone="red" onPress={confirmLeave} />
    </Screen>
  );
}

function MemberRow({
  member,
  isMe,
  totalDays,
}: {
  member: GroupMember;
  isMe: boolean;
  totalDays?: number;
}) {
  const stats = member.stats;
  return (
    <View style={styles.memberRow}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(member.name) }]}>
        <Text style={styles.avatarText}>{initials(member.name)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>
          {member.name}
          {isMe ? " (you)" : ""}
        </Text>
        <Text style={styles.memberSub}>
          {stats ? `Day ${stats.dayNumber}/${stats.totalDays ?? totalDays ?? "—"} · ${stats.challengeName}` : "No update yet"}
        </Text>
      </View>
      {stats ? (
        <Text style={styles.streak}>🔥 {stats.streak}</Text>
      ) : (
        <Text style={styles.streak}>—</Text>
      )}
    </View>
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
  input: {
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: 15,
  },
  errorText: { color: COLORS.red, fontSize: 13 },
  codeChip: {
    backgroundColor: COLORS.chip,
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    alignSelf: "flex-start",
  },
  codeChipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#06210F", fontWeight: "800", fontSize: 14 },
  memberName: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  memberSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  streak: { color: COLORS.gold, fontWeight: "800", fontSize: 14 },
  milestoneTitle: { color: COLORS.gold, fontSize: 15, fontWeight: "800" },
  milestoneBody: { color: COLORS.text, fontSize: 14 },
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
});
