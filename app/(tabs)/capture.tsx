import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import TagChip from "@/src/components/TagChip";
import { PRESET_TAGS } from "@/src/constants/tags";
import { createLead, fetchTagSuggestions, type CustomField } from "@/src/api";
import { colors, spacing, radius, font, fonts } from "@/src/theme";

export default function Capture() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState(""); const [notes, setNotes] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);

  const reset = () => { setName(""); setEmail(""); setPhone(""); setCompany(""); setJobTitle(""); setNotes(""); setInterests([]); setCustomTags([]); setNewTag(""); setCustomFields([]); setError(""); };
  useFocusEffect(useCallback(() => {
    fetchTagSuggestions().then((tags) => setSuggestions(tags.filter((t) => !PRESET_TAGS.includes(t))));
  }, []));

  const toggleTag = (tag: string) => setInterests((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  const addCustomTag = () => {
    const t = newTag.trim(); if (!t) return;
    if (!customTags.includes(t) && !PRESET_TAGS.includes(t)) setCustomTags((prev) => [...prev, t]);
    if (!interests.includes(t)) setInterests((prev) => [...prev, t]);
    setNewTag(""); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const addCustomField = () => setCustomFields((prev) => [...prev, { label: "", value: "" }]);
  const updateCustomField = (i: number, key: keyof CustomField, val: string) =>
    setCustomFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));
  const removeCustomField = (i: number) => setCustomFields((prev) => prev.filter((_, idx) => idx !== i));

  const onSave = async () => {
    if (!name.trim()) { setError("Name is required"); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    setSaving(true); setError("");
    await createLead({
      name: name.trim(), email: email.trim(), phone: phone.trim(), company: company.trim(),
      jobTitle: jobTitle.trim(), interests,
      customFields: customFields.filter((f) => f.label.trim() && f.value.trim()),
      notes: notes.trim(), followedUp: false,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const savedName = name.trim(); reset(); setSaving(false);
    router.push({ pathname: "/success", params: { name: savedName } });
  };

  const allTags = [...PRESET_TAGS, ...customTags, ...suggestions.filter((s) => !customTags.includes(s))];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>New Lead</Text>
        <Text style={styles.subtitle}>Fill it fast — tap tags to add interests</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Field label="Name *"><TextInput testID="input-name" value={name} onChangeText={setName} placeholder="Jane Doe" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} autoFocus returnKeyType="next" /></Field>
        <Field label="Email"><TextInput testID="input-email" value={email} onChangeText={setEmail} placeholder="jane@company.com" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} keyboardType="email-address" autoCapitalize="none" /></Field>
        <View style={styles.twoCol}><Field label="Phone" style={{ flex: 1 }}><TextInput testID="input-phone" value={phone} onChangeText={setPhone} placeholder="+1 555…" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} keyboardType="phone-pad" /></Field></View>
        <Field label="Company"><TextInput testID="input-company" value={company} onChangeText={setCompany} placeholder="Acme Inc." placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} /></Field>
        <Field label="Job Title"><TextInput testID="input-jobtitle" value={jobTitle} onChangeText={setJobTitle} placeholder="Head of Sales" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} /></Field>
        <Text style={styles.sectionLabel}>Interests</Text>
        <View style={styles.tagWrap}>
          {allTags.map((tag) => (<TagChip key={tag} testID={`tag-${tag}`} label={tag} active={interests.includes(tag)} onToggle={toggleTag} />))}
        </View>
        <View style={styles.addTagRow}>
          <TextInput testID="input-custom-tag" value={newTag} onChangeText={setNewTag} placeholder="Add custom tag…" placeholderTextColor={colors.onSurfaceSecondary} style={[styles.input, { flex: 1 }]} onSubmitEditing={addCustomTag} returnKeyType="done" />
          <Pressable testID="add-tag-button" style={styles.addBtn} onPress={addCustomTag}><Ionicons name="add" size={22} color={colors.onBrandPrimary} /></Pressable>
        </View>
        <Text style={styles.sectionLabel}>Custom fields</Text>
        {customFields.map((f, i) => (
          <View key={i} style={styles.customFieldRow}>
            <TextInput testID={`custom-field-label-${i}`} value={f.label} onChangeText={(v) => updateCustomField(i, "label", v)} placeholder="Label" placeholderTextColor={colors.onSurfaceSecondary} style={[styles.input, { flex: 1 }]} />
            <TextInput testID={`custom-field-value-${i}`} value={f.value} onChangeText={(v) => updateCustomField(i, "value", v)} placeholder="Value" placeholderTextColor={colors.onSurfaceSecondary} style={[styles.input, { flex: 1 }]} />
            <Pressable hitSlop={8} onPress={() => removeCustomField(i)}><Ionicons name="close-circle" size={24} color={colors.onSurfaceSecondary} /></Pressable>
          </View>
        ))}
        <Pressable testID="add-custom-field" style={styles.ghostBtn} onPress={addCustomField}><Ionicons name="add" size={18} color={colors.brand} /><Text style={styles.ghostBtnText}>Add custom field</Text></Pressable>
        <Field label="Notes"><TextInput testID="input-notes" value={notes} onChangeText={setNotes} placeholder="Met at booth, wants a demo…" placeholderTextColor={colors.onSurfaceSecondary} style={[styles.input, styles.textArea]} multiline /></Field>
        {error ? <Text testID="form-error" style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <View style={[styles.ctaWrap, { paddingBottom: spacing.md }]}>
        <Pressable testID="save-lead-button" style={styles.cta} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.onBrandPrimary} /> : (<><Ionicons name="save" size={20} color={colors.onBrandPrimary} /><Text style={styles.ctaText}>Save Lead</Text></>)}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return (<View style={[styles.field, style]}><Text style={styles.fieldLabel}>{label}</Text>{children}</View>);
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 28 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.sm },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  field: { marginBottom: spacing.md },
  fieldLabel: { color: colors.onSurfaceSecondary, fontFamily: fonts.textMedium, fontSize: font.sm, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 48, color: colors.onSurface, fontFamily: fonts.text, fontSize: font.lg },
  textArea: { minHeight: 90, paddingTop: spacing.md, textAlignVertical: "top" },
  twoCol: { flexDirection: "row", gap: spacing.md },
  sectionLabel: { color: colors.onSurface, fontFamily: fonts.textBold, fontSize: font.lg, marginTop: spacing.sm, marginBottom: spacing.md },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  addTagRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  addBtn: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  customFieldRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  ghostBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, alignSelf: "flex-start", marginTop: spacing.xs, marginBottom: spacing.md },
  ghostBtnText: { color: colors.brand, fontFamily: fonts.textMedium, fontSize: font.base },
  error: { color: colors.error, fontFamily: fonts.textMedium, fontSize: font.base, marginTop: spacing.sm },
  ctaWrap: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: 0, backgroundColor: colors.surface, paddingTop: spacing.sm },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.brand, height: 56, borderRadius: radius.md },
  ctaText: { color: colors.onBrandPrimary, fontFamily: fonts.textBold, fontSize: font.lg },
});
