import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { colors, fonts } from "@/src/theme";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarActiveTintColor: colors.brand, tabBarInactiveTintColor: colors.onSurfaceSecondary,
      tabBarStyle: { backgroundColor: colors.surfaceSecondary, borderTopColor: colors.border, borderTopWidth: 1, height: 88, paddingTop: 8 },
      tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 11 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="capture" options={{ title: "Capture", tabBarIcon: ({ focused }) => (
        <View style={[styles.captureBtn, focused && styles.captureBtnActive]}><Ionicons name="add" size={30} color={colors.onBrandPrimary} /></View>
      ) }} />
      <Tabs.Screen name="leads" options={{ title: "Leads", tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  captureBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", marginTop: -18, shadowColor: colors.brand, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  captureBtnActive: { backgroundColor: colors.brandSecondary },
});
