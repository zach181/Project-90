import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, LayoutChangeEvent } from "react-native";
import Svg, { Line, Path, Circle, Text as SvgText } from "react-native-svg";
import { COLORS, SPACING } from "../constants/theme";
import { formatWeight, type WeightPoint } from "../utils/weight";

// SVG text falls back to a serif face on web unless told otherwise; native already defaults to the system font.
const FONT = Platform.OS === "web" ? "system-ui, -apple-system, sans-serif" : undefined;
const HEIGHT = 190;
const PAD = { left: 40, right: 14, top: 14, bottom: 26 };

/**
 * Weight over the challenge. The x-axis grows a week at a time (min 2 weeks, capped at the
 * challenge length), so the line keeps stretching across the chart as days go by.
 */
export function WeightChart({
  points,
  currentDay,
  totalDays,
}: {
  points: WeightPoint[];
  currentDay: number;
  totalDays: number;
}) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const last = points[points.length - 1];
  const first = points[0];

  const xMax = Math.min(totalDays, Math.max(14, Math.ceil(Math.max(currentDay, last?.day ?? 1) / 7) * 7));

  const weights = points.map((p) => p.weight);
  let lo = Math.min(...weights);
  let hi = Math.max(...weights);
  if (hi - lo < 4) {
    const mid = (hi + lo) / 2;
    lo = mid - 2;
    hi = mid + 2;
  }
  const pad = (hi - lo) * 0.15;
  const yMin = lo - pad;
  const yMax = hi + pad;

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (day: number) => PAD.left + ((day - 1) / Math.max(1, xMax - 1)) * innerW;
  const y = (w: number) => PAD.top + (1 - (w - yMin) / (yMax - yMin)) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day)},${y(p.weight)}`).join(" ");
  const area =
    points.length > 1
      ? `${line} L${x(last.day)},${PAD.top + innerH} L${x(first.day)},${PAD.top + innerH} Z`
      : "";

  const ticks = [yMax - pad * 0.5, (yMin + yMax) / 2, yMin + pad * 0.5];
  const tickDecimals = hi - lo > 8 ? 0 : 1;
  const midDay = Math.round((1 + xMax) / 2);

  const change = last.weight - first.weight;
  const changeText =
    points.length < 2 ? "—" : `${change > 0 ? "+" : change < 0 ? "−" : ""}${formatWeight(Math.abs(Math.round(change * 10) / 10))} lbs`;

  return (
    <View style={{ gap: SPACING.md }}>
      <View style={styles.stats}>
        <Stat label="Start" value={`${formatWeight(first.weight)}`} />
        <Stat label="Now" value={`${formatWeight(last.weight)}`} />
        <Stat label="Change" value={changeText} />
      </View>

      <View onLayout={onLayout} style={{ height: HEIGHT }}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {ticks.map((t, i) => (
              <React.Fragment key={i}>
                <Line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={COLORS.border}
                  strokeWidth={1}
                />
                <SvgText x={PAD.left - 8} y={y(t) + 4} fontSize={10} fontFamily={FONT} fill={COLORS.textFaint} textAnchor="end">
                  {t.toFixed(tickDecimals)}
                </SvgText>
              </React.Fragment>
            ))}

            {area ? <Path d={area} fill="rgba(46,204,113,0.12)" /> : null}
            {points.length > 1 ? (
              <Path d={line} stroke={COLORS.accent} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            ) : null}
            {points.map((p) => (
              <Circle key={p.day} cx={x(p.day)} cy={y(p.weight)} r={3.5} fill={COLORS.accent} />
            ))}
            <Circle cx={x(last.day)} cy={y(last.weight)} r={7} fill="none" stroke={COLORS.gold} strokeWidth={2} />

            <SvgText x={PAD.left} y={HEIGHT - 6} fontSize={10} fontFamily={FONT} fill={COLORS.textFaint} textAnchor="start">
              Day 1
            </SvgText>
            <SvgText x={PAD.left + innerW / 2} y={HEIGHT - 6} fontSize={10} fontFamily={FONT} fill={COLORS.textFaint} textAnchor="middle">
              {midDay}
            </SvgText>
            <SvgText x={width - PAD.right} y={HEIGHT - 6} fontSize={10} fontFamily={FONT} fill={COLORS.textFaint} textAnchor="end">
              Day {xMax}
            </SvgText>
          </Svg>
        )}
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: SPACING.sm },
  stat: { flex: 1, gap: 2 },
  statValue: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  statLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
});
