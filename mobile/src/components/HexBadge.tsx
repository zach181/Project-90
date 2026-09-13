import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon } from "react-native-svg";

function hexPoints(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

export function HexBadge({
  size = 72,
  fill,
  stroke,
  icon,
}: {
  size?: number;
  fill: string;
  stroke: string;
  icon: string;
}) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Polygon points={hexPoints(size)} fill={fill} stroke={stroke} strokeWidth={2} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={{ fontSize: size * 0.36 }}>{icon}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
