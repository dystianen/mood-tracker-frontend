import { getMonthlyMood } from "@/api/moodApi";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const WIDTH = Dimensions.get("window").width - 32;

const MOOD_VALUE: any = {
  "Sangat Senang": 5,
  Senang: 4,
  "Biasa Saja": 3,
  Sedih: 2,
  "Sangat Sedih": 1,
};

export default function MoodReport() {
  const [chartData, setChartData] = useState([]);
  const [raw, setRaw] = useState([]);

  const load = async () => {
    const data = await getMonthlyMood(12, 2025);

    const generateColor = (val: number) => {
      if (val === 5) return "#4CAF50";
      if (val === 4) return "#8BC34A";
      if (val === 3) return "#FFC107";
      if (val === 2) return "#FF9800";
      return "#F44336";
    };

    const mapped = data.map((i: any) => {
      const value = MOOD_VALUE[i.mood];
      return {
        value,
        label: dayjs(i.date).format("DD"),
        labelComponent: () => (
          <Text style={{ fontSize: 10, color: "#777" }}>
            {dayjs(i.date).format("DD")}
          </Text>
        ),
        dataPointColor: generateColor(value),
        focusedDataPointColor: generateColor(value),
        dataPointText: value.toString(),
      };
    });

    setChartData(mapped);
    setRaw(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
        Laporan Mood Bulanan
      </Text>

      {chartData.length > 0 && (
        <LineChart
          data={chartData}
          curved
          width={WIDTH}
          height={260}
          thickness={4}
          color="#6366F1"
          hideRules={false}
          hideYAxisText
          yAxisTextStyle={{ color: "#999" }}
          xAxisThickness={1}
          yAxisThickness={1}
          startFillColor="#a5b4fc"
          endFillColor="#eef2ff"
          startOpacity={0.4}
          endOpacity={0.01}
          initialSpacing={20}
          dataPointsHeight={14}
          dataPointsWidth={14}
          dataPointsColor="#6366F1"
          isAnimated
          animationDuration={800}
          pointerConfig={{
            pointerColor: "#4F46E5",
            pointerStripColor: "#4F46E5",
            pointerStripHeight: 200,
            pointerLabelWidth: 100,
            pointerLabelHeight: 80,
            pointerLabelComponent: (item: any) => {
              const moodName = Object.keys(MOOD_VALUE).find(
                (key) => MOOD_VALUE[key] === item.value
              );

              return (
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 8,
                    borderRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                    {moodName}
                  </Text>
                  <Text style={{ fontSize: 12 }}>Tanggal {item.label}</Text>
                </View>
              );
            },
          }}
        />
      )}

      <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 14 }}>
        Detail Mood Harian
      </Text>

      <ScrollView>
        {raw.map((i: any) => (
          <View
            key={i.mood_id}
            style={{
              backgroundColor: "white",
              padding: 12,
              marginBottom: 12,
              borderRadius: 12,
              borderLeftWidth: 6,
              borderLeftColor: i.color,
              elevation: 3,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              {dayjs(i.date).format("DD MMMM YYYY")}
            </Text>
            <Text>Mood: {i.mood}</Text>
            <Text style={{ color: "#444" }}>Catatan: {i.note ?? "-"}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
