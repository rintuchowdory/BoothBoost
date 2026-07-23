import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, font, fonts } from "@/src/theme";
import type { Lead } from "@/src/api";

function initials(lead: Lead): string {
  const base = lead.company || lead.name || "?";
  const parts = base.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
type Props = { lead: Lead; onPress: () => void; onToggleFollow: () => void };

export default function LeadCard({ lead, onPress, onToggleFollow }: Props) {
  return (
    <Pressable testID={`lead-card-${lead.id}`} onPress={onPress} style={styles.card}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{initials(lead)}</Text></View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{lead.name}{lead._pending ? "  ·  ⏳" : ""}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {[lead.jobTitle, lead.company].filter(Boolean).join(" · ") || "No company"}
        </Text>
        {lead.interests.length > 0 && (
          <View style={styles.tagRow}>
            {lead.interests.slice(0, 3).map((t) => (
              <View key={t} style={styles.miniTag}><Text style={styles.miniTagText}>{t}</Text></View>
            ))}
            {lead.interests.length > 3 && <Text style={styles.more}>+{lead.interests.length - 3}</Text>}
          </View>
        )}
      </View>
      <Pressable testID={`lead-follow-toggle-${lead.id}`} hitSlop={10} onPress={onToggleFollow} style={styles.followBtn}>
        <Ionicons name={lead.followedUp ? "checkmark-circle" : "ellipse-outline"} size={26}
          color={lead.followedUp ? colors.success : colors.onSurfaceSecondary} />
      </Pressable>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md },
  avatar: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.onBrandTertiary, fontFamily: fonts.display, fontSize: font.lg },
  info: { flex: 1, gap: 2 },
  name: { color: colors.onSurface, fontFamily: fonts.textBold, fontSize: font.lg },
  sub: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.sm },
  tagRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 4 },
  miniTag: { backgroundColor: colors.surfaceTertiary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  miniTagText: { color: colors.onSurfaceTertiary, fontSize: 11, fontFamily: fonts.text },
  more: { color: colors.onSurfaceSecondary, fontSize: 11, fontFamily: fonts.text },
  followBtn: { padding: spacing.xs },
});
