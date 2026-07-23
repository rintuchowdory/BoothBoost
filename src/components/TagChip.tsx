import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, font, fonts } from "@/src/theme";

type Props = { label: string; active: boolean; onToggle: (label: string) => void; testID?: string };

export default function TagChip({ label, active, onToggle, testID }: Props) {
  return (
    <Pressable testID={testID}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(label); }}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  chip: { paddingHorizontal: spacing.lg, height: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipInactive: { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
  text: { fontSize: font.base, fontFamily: fonts.textMedium },
  textActive: { color: colors.onBrandPrimary },
  textInactive: { color: colors.onSurfaceTertiary },
});
