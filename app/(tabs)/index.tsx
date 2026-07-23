import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Orb3D from "@/src/components/Orb3D";
import { fetchStats, type Stats } from "@/src/api";
import { colors, spacing, radius, font, fonts } from "@/src/theme";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const s = await fetchStats(); setStats(s); setLoading(false); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.brand} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>BOOTHBOOST</Text>
            <Text style={styles.tagline}>Capture. Tag. Follow up.</Text>
          </View>
          <View style={styles.liveDot}><View style={styles.dot} /><Text style={styles.liveText}>LIVE</Text></View>
        </View>
        <View style={styles.heroWrap} testID="home-3d-hero"><Orb3D size={230} /></View>
        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginVertical: spacing["2xl"] }} />
        ) : (
          <>
            <View style={styles.metricRow}>
              <Metric label="Today" value={stats?.today ?? 0} accent testID="stat-today" />
              <Metric label="Total" value={stats?.total ?? 0} testID="stat-total" />
            </View>
            <View style={styles.metricRow}>
              <Metric label="Followed up" value={stats?.followedUp ?? 0} testID="stat-followed" />
              <Metric label="Pending" value={stats?.pending ?? 0} testID="stat-pending" />
            </View>
            {stats && stats.topInterests.length > 0 && (
              <View style={styles.topCard}>
                <Text style={styles.topTitle}>TOP INTERESTS</Text>
                {stats.topInterests.map((t) => (
                  <View key={t.tag} style={styles.topRow}>
                    <Text style={styles.topTag} numberOfLines={1}>{t.tag}</Text>
                    <Text style={styles.topCount}>{t.count}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      <View style={[styles.ctaWrap, { paddingBottom: spacing.md }]}>
        <Pressable testID="capture-lead-cta" style={styles.cta} onPress={() => router.push("/(tabs)/capture")}>
          <Ionicons name="add-circle" size={22} color={colors.onBrandPrimary} />
          <Text style={styles.ctaText}>Capture Lead</Text>
        </Pressable>
      </View>
    </View>
  );
}
function Metric({ label, value, accent, testID }: { label: string; value: number; accent?: boolean; testID?: string }) {
  return (
    <View style={[styles.metric, accent && styles.metricAccent]} testID={testID}>
      <Text style={[styles.metricValue, accent && { color: colors.brand }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },
  brand: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 28, letterSpacing: 1 },
  tagline: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.sm },
  liveDot: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  liveText: { color: colors.onSurfaceSecondary, fontSize: 10, fontFamily: fonts.textBold },
  heroWrap: { alignItems: "center", justifyContent: "center", marginVertical: spacing.md },
  metricRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  metric: { flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  metricAccent: { borderColor: colors.brand },
  metricValue: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 40 },
  metricLabel: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.sm },
  topCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.md, gap: spacing.sm },
  topTitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.textBold, fontSize: 11, letterSpacing: 1, marginBottom: spacing.xs },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topTag: { color: colors.onSurfaceTertiary, fontFamily: fonts.textMedium, fontSize: font.base, flex: 1 },
  topCount: { color: colors.brand, fontFamily: fonts.display, fontSize: font.lg },
  ctaWrap: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: 88 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.brand, height: 56, borderRadius: radius.md },
  ctaText: { color: colors.onBrandPrimary, fontFamily: fonts.textBold, fontSize: font.lg },
});

