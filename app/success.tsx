import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import Orb3D from "@/src/components/Orb3D";
import { colors, spacing, radius, font, fonts } from "@/src/theme";

export default function Success() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const scale = useSharedValue(0.6); const opacity = useSharedValue(0); const checkScale = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220 });
    scale.value = withSpring(1, { damping: 12 });
    checkScale.value = withSpring(1, { damping: 9, stiffness: 140 });
  }, [opacity, scale, checkScale]);
  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.heroWrap}>
          <Orb3D size={180} />
          <Animated.View style={[styles.checkBadge, checkStyle]}><Ionicons name="checkmark" size={38} color={colors.onSuccess} /></Animated.View>
        </View>
        <Text style={styles.title}>Lead Secured!</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{name ? `${name} has been added to your leads.` : "Your lead has been saved."}</Text>
        <Pressable testID="capture-next-button" style={styles.primary} onPress={() => router.replace("/(tabs)/capture")}><Ionicons name="add" size={20} color={colors.onBrandPrimary} /><Text style={styles.primaryText}>Capture Next</Text></Pressable>
        <Pressable testID="success-done-button" style={styles.secondary} onPress={() => router.replace("/(tabs)")}><Text style={styles.secondaryText}>Done</Text></Pressable>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  card: { width: "100%", backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, alignItems: "center" },
  heroWrap: { alignItems: "center", justifyContent: "center" },
  checkBadge: { position: "absolute", bottom: 6, right: "30%", width: 58, height: 58, borderRadius: 29, backgroundColor: colors.success, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.surfaceSecondary },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 30, marginTop: spacing.sm },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: font.base, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.xl },
  primary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.brand, height: 54, borderRadius: radius.md, width: "100%" },
  primaryText: { color: colors.onBrandPrimary, fontFamily: fonts.textBold, fontSize: font.lg },
  secondary: { height: 48, alignItems: "center", justifyContent: "center", marginTop: spacing.sm },
  secondaryText: { color: colors.onSurfaceSecondary, fontFamily: fonts.textMedium, fontSize: font.base },
});
