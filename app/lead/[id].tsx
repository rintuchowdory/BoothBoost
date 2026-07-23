import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fetchLeads, updateLead, deleteLead, type Lead } from "@/src/api";
import { colors, spacing, radius, font, fonts } from "@/src/theme";

export default function LeadDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const all = await fetchLeads(); setLead(all.find((l) => l.id === id) ?? null); setLoading(false); }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleFollow = async () => {
    if (!lead) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !lead.followedUp; setLead({ ...lead, followedUp: next });
    if (!lead._pending) { try { await updateLead(lead.id, { followedUp: next }); } catch {} }
  };
  const onDelete = async () => {
    if (!lead) return; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (!lead._pending) { try { await deleteLead(lead.id); } catch {} }
    router.back();
  };

  if (loading) return (<View style={[styles.container, styles.center]}><ActivityIndicator color={colors.brand} /></View>);
  if (!lead) return (<View style={[styles.container, styles.center, { paddingTop: insets.top }]}><Text style={styles.title}>Lead not found</Text><Pressable style={styles.backLink} onPress={() => router.back()}><Text style={styles.backLinkText}>Go back</Text></Pressable></View>);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable testID="detail-back" hitSlop={10} onPress={() => router.back()}><Ionicons name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        <Pressable testID="detail-delete" hitSlop={10} onPress={onDelete}><Ionicons name="trash-outline" size={22} color={colors.error} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(lead.company || lead.name || "?").slice(0, 2).toUpperCase()}</Text></View>
        <Text style={styles.name}>{lead.name}</Text>
        <Text style={styles.role}>{[lead.jobTitle, lead.company].filter(Boolean).join(" · ") || "—"}</Text>
        <View style={[styles.statusPill, lead.followedUp ? styles.statusDone : styles.statusPending]}>
          <Ionicons name={lead.followedUp ? "checkmark-circle" : "time-outline"} size={16} color={lead.followedUp ? colors.success : colors.warning} />
          <Text style={[styles.statusText, { color: lead.followedUp ? colors.success : colors.warning }]}>{lead.followedUp ? "Followed up" : "Pending follow-up"}</Text>
        </View>
        {lead.email ? <ContactRow icon="mail" value={lead.email} onPress={() => Linking.openURL(`mailto:${lead.email}`)} /> : null}
        {lead.phone ? <ContactRow icon="call" value={lead.phone} onPress={() => Linking.openURL(`tel:${lead.phone}`)} /> : null}
        {lead.interests.length > 0 && (<><Text style={styles.sectionLabel}>Interests</Text><View style={styles.tagWrap}>{lead.interests.map((t) => (<View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>))}</View></>)}
        {lead.customFields.length > 0 && (<><Text style={styles.sectionLabel}>Details</Text>{lead.customFields.map((f, i) => (<View key={i} style={styles.detailRow}><Text style={styles.detailLabel}>{f.label}</Text><Text style={styles.detailValue}>{f.value}</Text></View>))}</>)}
        {lead.notes ? (<><Text style={styles.sectionLabel}>Notes</Text><View style={styles.notesBox}><Text style={styles.notesText}>{lead.notes}</Text></View></>) : null}
      </ScrollView>
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable testID="detail-toggle-follow" style={[styles.cta, lead.followedUp && styles.ctaDone]} onPress={toggleFollow}>
          <Ionicons name={lead.followedUp ? "arrow-undo" : "checkmark-done"} size={20} color={lead.followedUp ? colors.onSurface : colors.onBrandPrimary} />
          <Text style={[styles.ctaText, lead.followedUp && { color: colors.onSurface }]}>{lead.followedUp ? "Mark as pending" : "Mark as followed up"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
function ContactRow({ icon, value, onPress }: { icon: any; value: string; onPress: () => void }) {
  return (<Pressable style={styles.contactRow} onPress={onPress}><Ionicons name={icon} size={20} color={colors.brand} /><Text style={styles.contactText}>{value}</Text><Ionicons name="open-outline" size={16} color={colors.onSurfaceSecondary} /></Pressable>);
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },
  topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120, alignItems: "center" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  avatarText: { color: colors.onBrandTertiary, fontFamily: fonts.display, fontSize: 30 },
  name: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 28, marginTop: spacing.md },
  role: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.base },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, marginTop: spacing.md, marginBottom: spacing.lg },
  statusDone: { backgroundColor: "rgba(0,230,118,0.12)" },
  statusPending: { backgroundColor: "rgba(255,196,0,0.12)" },
  statusText: { fontFamily: fonts.textMedium, fontSize: font.sm },
  contactRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, width: "100%", marginBottom: spacing.sm },
  contactText: { flex: 1, color: colors.onSurface, fontFamily: fonts.textMedium, fontSize: font.base },
  sectionLabel: { alignSelf: "flex-start", color: colors.onSurfaceSecondary, fontFamily: fonts.textBold, fontSize: 11, letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignSelf: "flex-start" },
  tag: { backgroundColor: colors.brandTertiary, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  tagText: { color: colors.onBrandTertiary, fontFamily: fonts.textMedium, fontSize: font.sm },
  detailRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailLabel: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.base },
  detailValue: { color: colors.onSurface, fontFamily: fonts.textMedium, fontSize: font.base },
  notesBox: { width: "100%", backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  notesText: { color: colors.onSurfaceTertiary, fontFamily: fonts.text, fontSize: font.base, lineHeight: 22 },
  ctaWrap: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: 0, backgroundColor: colors.surface, paddingTop: spacing.sm },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.brand, height: 56, borderRadius: radius.md },
  ctaDone: { backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border },
  ctaText: { color: colors.onBrandPrimary, fontFamily: fonts.textBold, fontSize: font.lg },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: font.xl },
  backLink: { marginTop: spacing.md },
  backLinkText: { color: colors.brand, fontFamily: fonts.textMedium, fontSize: font.base },
});
