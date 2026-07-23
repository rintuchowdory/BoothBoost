import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import LeadCard from "@/src/components/LeadCard";
import { fetchLeads, updateLead, type Lead } from "@/src/api";
import { colors, spacing, radius, font, fonts } from "@/src/theme";

type Filter = "all" | "pending" | "followed";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" }, { key: "pending", label: "Pending" }, { key: "followed", label: "Followed up" }];

function toCsv(leads: Lead[]): string {
  const headers = ["Name","Email","Phone","Company","Job Title","Interests","Notes","Followed Up","Created At"];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l) => [l.name,l.email,l.phone,l.company,l.jobTitle,l.interests.join("; "),l.notes,l.followedUp?"Yes":"No",l.createdAt].map((x)=>esc(String(x??""))).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export default function Leads() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]); const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast] = useState("");
  const load = useCallback(async () => { const data = await fetchLeads(); setLeads(data); setLoading(false); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const filtered = useMemo(() => {
    let list = leads;
    if (filter === "pending") list = list.filter((l) => !l.followedUp);
    if (filter === "followed") list = list.filter((l) => l.followedUp);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.interests.some((t) => t.toLowerCase().includes(q)));
    return list;
  }, [leads, filter, query]);

  const toggleFollow = async (lead: Lead) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, followedUp: !l.followedUp } : l)));
    if (!lead._pending) { try { await updateLead(lead.id, { followedUp: !lead.followedUp }); } catch { showToast("Couldn't sync — will retry"); } }
  };

  const onExport = async () => {
    if (leads.length === 0) { showToast("No leads to export"); return; }
    const csv = toCsv(leads);
    try {
      const uri = FileSystem.documentDirectory + `boothboost-leads-${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Export leads" });
      else { await Clipboard.setStringAsync(csv); showToast("CSV copied to clipboard"); }
    } catch { await Clipboard.setStringAsync(csv); showToast("CSV copied to clipboard"); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Leads</Text>
          <Pressable testID="export-button" style={styles.exportBtn} onPress={onExport}>
            <Ionicons name="share-outline" size={18} color={colors.brand} /><Text style={styles.exportText}>Export CSV</Text>
          </Pressable>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.onSurfaceSecondary} />
          <TextInput testID="search-input" value={query} onChangeText={setQuery} placeholder="Search name, company, tag…" placeholderTextColor={colors.onSurfaceSecondary} style={styles.searchInput} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (<Pressable key={f.key} testID={`filter-${f.key}`} onPress={() => setFilter(f.key)} style={[styles.filterChip, active ? styles.filterActive : styles.filterInactive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text></Pressable>);
          })}
        </ScrollView>
      </View>
      {loading ? (<ActivityIndicator color={colors.brand} style={{ marginTop: spacing["3xl"] }} />) : (
        <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (<LeadCard lead={item} onPress={() => router.push({ pathname: "/lead/[id]", params: { id: item.id } })} onToggleFollow={() => toggleFollow(item)} />)}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={<View style={styles.empty} testID="leads-empty"><Ionicons name="people-outline" size={56} color={colors.onSurfaceSecondary} /><Text style={styles.emptyTitle}>No leads captured yet</Text><Text style={styles.emptySub}>Head to Capture to add your first lead.</Text></View>} />
      )}
      {toast ? <View style={[styles.toast, { bottom: insets.bottom + 100 }]} testID="toast"><Text style={styles.toastText}>{toast}</Text></View> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider, backgroundColor: colors.surface },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 28 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.brand, borderRadius: radius.pill, paddingHorizontal: spacing.md, height: 38 },
  exportText: { color: colors.brand, fontFamily: fonts.textMedium, fontSize: font.sm },
  searchBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 46, marginTop: spacing.md },
  searchInput: { flex: 1, color: colors.onSurface, fontFamily: fonts.text, fontSize: font.base },
  filterRow: { gap: spacing.sm, paddingTop: spacing.md, paddingRight: spacing.lg },
  filterChip: { height: 36, paddingHorizontal: spacing.lg, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  filterActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterInactive: { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
  filterText: { color: colors.onSurfaceTertiary, fontFamily: fonts.textMedium, fontSize: font.sm },
  filterTextActive: { color: colors.onBrandPrimary },
  list: { padding: spacing.lg, paddingBottom: 120 },
  empty: { alignItems: "center", marginTop: spacing["3xl"], gap: spacing.sm },
  emptyTitle: { color: colors.onSurface, fontFamily: fonts.textBold, fontSize: font.lg, marginTop: spacing.sm },
  emptySub: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.base },
  toast: { position: "absolute", alignSelf: "center", backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill },
  toastText: { color: colors.onSurface, fontFamily: fonts.textMedium, fontSize: font.base },
});
