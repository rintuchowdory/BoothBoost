import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { colors } from "@/src/theme";

type Props = { size?: number };

export default function Orb3D({ size = 220 }: Props) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1, false);
  }, [rot]);
  const ring1 = useAnimatedStyle(() => ({ transform: [{ rotateX: "72deg" }, { rotateZ: `${rot.value}deg` }] }));
  const ring2 = useAnimatedStyle(() => ({ transform: [{ rotateX: "68deg" }, { rotateZ: `${-rot.value * 0.8 + 60}deg` }] }));
  const coreR = size * 0.4;
  const ringR = size * 0.82;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.glow, { width: size * 0.9, height: size * 0.9, borderRadius: size }]} />
      <Animated.View style={[styles.ring, { width: ringR, height: ringR, borderRadius: ringR / 2, borderColor: colors.brandSecondary }, ring2]} />
      <LinearGradient colors={["#FFB088", colors.brand, "#B5300A"]} start={{ x: 0.2, y: 0.1 }} end={{ x: 0.9, y: 1 }}
        style={[styles.core, { width: coreR, height: coreR, borderRadius: coreR / 2 }]} />
      <View style={[styles.spec, { width: coreR * 0.3, height: coreR * 0.3, top: size / 2 - coreR * 0.42, left: size / 2 - coreR * 0.42 }]} />
      <Animated.View style={[styles.ring, { width: ringR, height: ringR, borderRadius: ringR / 2, borderColor: colors.brand }, ring1]} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  glow: { position: "absolute", backgroundColor: colors.brand, opacity: 0.18 },
  ring: { position: "absolute", borderWidth: 2 },
  core: { position: "absolute" },
  spec: { position: "absolute", backgroundColor: "#FFFFFF", opacity: 0.5, borderRadius: 999 },
});
