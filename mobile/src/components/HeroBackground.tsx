import React from "react";
import { ImageBackground, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/theme";

const MOUNTAIN_BG = require("../../assets/backgrounds/mountain-hero.jpg");

/**
 * A photographic backdrop (moody mountain sunrise) with a dark gradient wash so
 * text stays legible. "card" keeps a rounded box; "banner" fades all the way
 * down into COLORS.background so it blends into the page below it.
 */
export function HeroBackground({
  children,
  style,
  radius = 0,
  variant = "card",
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: "card" | "banner";
}) {
  const gradientColors =
    variant === "banner"
      ? (["rgba(10,11,13,0.05)", "rgba(10,11,13,0.15)", COLORS.background] as const)
      : (["rgba(10,11,13,0.08)", "rgba(10,11,13,0.68)"] as const);
  const locations = variant === "banner" ? ([0, 0.72, 1] as const) : ([0, 1] as const);

  return (
    <ImageBackground
      source={MOUNTAIN_BG}
      resizeMode="cover"
      style={[{ width: "100%", borderRadius: radius, overflow: "hidden" }, style]}
      imageStyle={{ borderRadius: radius }}
    >
      <LinearGradient colors={gradientColors} locations={locations} style={StyleSheet.absoluteFill} />
      {children}
    </ImageBackground>
  );
}
