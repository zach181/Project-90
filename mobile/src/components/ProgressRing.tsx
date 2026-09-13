import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "../constants/theme";

/** A circular progress indicator with arbitrary centered content (big number, label, etc). */
export function ProgressRing({
  size = 96,
  strokeWidth = 9,
  progress,
  color = COLORS.accent,
  trackColor = COLORS.surface,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  /** 0..1 */
  progress: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>
      <View style={{ alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}
