import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Canvas, Group, Circle, Path, Skia, RadialGradient, vec, BlurMask } from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { colors } from "@/src/theme";

type Props = { size?: number };

export default function Orb3D({ size = 220 }: Props) {
  const c = size / 2;
  const coreR = size * 0.2;
  const ringR = size * 0.42;
  const rot = useSharedValue(0);

  useEffect(() => {
    rot.value = withRepeat(withTiming(Math.PI * 2, { duration: 9000, easing: Easing.linear }), -1, false);
  }, [rot]);

  const ringPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addOval(Skia.XYWHRect(-ringR, -ringR, ringR * 2, ringR * 2));
    return p;
  }, [ringR]);
  const ringPath2 = useMemo(() => {
    const p = Skia.Path.Make();
    p.addOval(Skia.XYWHRect(-ringR * 0.78, -ringR * 0.78, ringR * 1.56, ringR * 1.56));
    return p;
  }, [ringR]);

  const ring1Transform = useDerivedValue(() => [
    { translateX: c }, { translateY: c }, { rotate: rot.value }, { scaleY: 0.32 }]);
  const ring2Transform = useDerivedValue(() => [
    { translateX: c }, { translateY: c }, { rotate: -rot.value * 0.8 }, { rotateZ: 1.1 }, { scaleY: 0.36 }]);
  const dotTransform = useDerivedValue(() => [
    { translateX: c + Math.cos(rot.value) * ringR }, { translateY: c + Math.sin(rot.value) * ringR * 0.32 }]);
  const dot2Transform = useDerivedValue(() => [
    { translateX: c + Math.cos(-rot.value * 0.8 + 2) * ringR * 0.78 },
    { translateY: c + Math.sin(-rot.value * 0.8 + 2) * ringR * 0.78 * 0.36 }]);

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ flex: 1 }}>
        <Circle cx={c} cy={c} r={coreR * 1.9} color={colors.brand} opacity={0.18}>
          <BlurMask blur={30} style="normal" />
        </Circle>
        <Group transform={ring2Transform}>
          <Path path={ringPath2} style="stroke" strokeWidth={2} color={colors.brandSecondary} opacity={0.45} />
        </Group>
        <Circle cx={c} cy={c} r={coreR}>
          <RadialGradient c={vec(c - coreR * 0.35, c - coreR * 0.35)} r={coreR * 1.6}
            colors={["#FFB088", colors.brand, "#B5300A"]} />
        </Circle>
        <Circle cx={c - coreR * 0.35} cy={c - coreR * 0.35} r={coreR * 0.28} color="#FFFFFF" opacity={0.55}>
          <BlurMask blur={6} style="normal" />
        </Circle>
        <Group transform={ring1Transform}>
          <Path path={ringPath} style="stroke" strokeWidth={2.5} color={colors.brand} opacity={0.8} />
        </Group>
        <Group transform={dotTransform}>
          <Circle cx={0} cy={0} r={5} color={colors.brandSecondary}><BlurMask blur={4} style="solid" /></Circle>
        </Group>
        <Group transform={dot2Transform}>
          <Circle cx={0} cy={0} r={3.5} color="#FFD1B8" />
        </Group>
      </Canvas>
    </View>
  );
}
