import React from "react";
import { Text, View } from "react-native";

type TRecommendation = {
  average_mood: number;
  low_moood_days: number;
  level: string;
  recommendation: string;
};

const Recommendation = ({ data }: { data: TRecommendation }) => {
  return (
    <View
      style={{
        backgroundColor:
          data.level === "good"
            ? "#ECFDF5"
            : data.level === "neutral"
            ? "#FFFBEB"
            : "#FEF2F2",
        borderRadius: 16,
        elevation: 1,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 6,
        borderLeftColor:
          data.level === "good"
            ? "#10B981"
            : data.level === "neutral"
            ? "#F59E0B"
            : "#EF4444",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>
        Rekomendasi
      </Text>

      <Text style={{ fontSize: 14, color: "#334155" }}>
        Level Mood: {data.level}
      </Text>
      <Text style={{ fontSize: 14, color: "#334155" }}>
        Rata-rata Mood: {data.average_mood}/5
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: "#1F2937",
          lineHeight: 20,
          fontSize: 14,
          fontStyle: "italic",
        }}
      >
        “{data.recommendation}”
      </Text>
    </View>
  );
};

export default Recommendation;
