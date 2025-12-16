import { getMonthlyMood, getRecommendation } from "@/api/moodApi";
import Recommendation from "@/components/Recommendation";
import MOOD_VALUE from "@/constants/moodValue";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

const WIDTH = Dimensions.get("window").width - 32;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export default function MoodReport() {
  const [chartData, setChartData] = useState<any>([]);
  const [raw, setRaw] = useState([]);
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [loading, setLoading] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const itemRefs = useRef<View[]>([]);

  const loadRecommendationMood = useCallback(
    async (m = month, y = year, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingRecommendation(true);
      }

      const recommendation = await getRecommendation(m, y);
      setRecommendation(recommendation);
      setLoadingRecommendation(false);
    },
    [month, year]
  );

  const load = useCallback(
    async (m = month, y = year, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getMonthlyMood(m, y);

        const generateColor = (val: number) => {
          if (val === 5) return "#4CAF50";
          if (val === 4) return "#8BC34A";
          if (val === 3) return "#FFC107";
          if (val === 2) return "#FF9800";
          return "#F44336";
        };

        const mapped = [...data]
          .sort(
            (a: any, b: any) =>
              dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
          )
          .map((i: any) => {
            const value = MOOD_VALUE[i.mood];
            return {
              value,
              label: dayjs(i.date).format("DD"),
              dataPointColor: generateColor(value),
            };
          });

        setChartData(mapped);
        setRaw(data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [month, year]
  );

  useEffect(() => {
    load(month, year);
    loadRecommendationMood(month, year);
  }, [load, loadRecommendationMood, month, year]);

  useEffect(() => {
    const index = month - 1;
    const item = itemRefs.current[index];

    if (item && scrollRef.current) {
      item.measureLayout(
        // @ts-ignore
        scrollRef.current,
        (x) => {
          scrollRef.current?.scrollTo({
            x: Math.max(0, x - 40),
            animated: true,
          });
        },
        () => {}
      );
    }
  }, [month]);

  const EmptyRecommendation = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>Rekomendasi</Text>
      <Text style={styles.emptyDesc}>
        Belum ada rekomendasi untuk periode ini. Isi mood kamu secara rutin agar
        kami bisa memberikan saran yang lebih relevan ✨
      </Text>
    </View>
  );

  const EmptyChart = ({ month, year }: { month: number; year: number }) => (
    <View style={styles.emptyChart}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyHeading}>Belum ada data mood</Text>
      <Text style={styles.emptySub}>
        {dayjs(`${year}-${month}-01`).format("MMMM YYYY")}
      </Text>
    </View>
  );

  const EmptyDetail = () => (
    <View style={styles.emptyDetail}>
      <Text style={styles.emptyIconSmall}>📝</Text>
      <Text style={styles.emptyHeading}>Belum ada catatan mood</Text>
      <Text style={styles.emptySubCenter}>
        Isi mood harian kamu untuk melihat laporan di sini
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Laporan Mood Bulanan</Text>

        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Periode</Text>

            <View style={styles.yearPicker}>
              <Pressable onPress={() => setYear(year - 1)}>
                <Text style={styles.yearArrow}>◀</Text>
              </Pressable>

              <Text style={styles.yearText}>{year}</Text>

              <Pressable onPress={() => setYear(year + 1)}>
                <Text style={styles.yearArrow}>▶</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthScroll}
          >
            {MONTHS.map((m, idx) => {
              const active = month === idx + 1;

              return (
                <Pressable
                  key={m}
                  ref={(el) => {
                    if (el) itemRefs.current[idx] = el;
                  }}
                  onPress={() => setMonth(idx + 1)}
                  style={({ pressed }) => [
                    styles.monthItem,
                    active && styles.monthItemActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.monthText, active && styles.monthTextActive]}
                  >
                    {m}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              load(month, year, true);
              loadRecommendationMood(month, year, true);
            }}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      >
        {loadingRecommendation ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Memuat rekomendasi...</Text>
          </View>
        ) : recommendation ? (
          <Recommendation data={recommendation} />
        ) : (
          <EmptyRecommendation />
        )}

        {/* Chart */}
        <View style={styles.chartWrapper}>
          {loading ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Memuat data mood...</Text>
            </View>
          ) : chartData.length > 0 ? (
            <View style={styles.chartCard}>
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
                        <Text style={{ fontSize: 12 }}>
                          Tanggal {item.label}
                        </Text>
                      </View>
                    );
                  },
                }}
              />
            </View>
          ) : (
            <EmptyChart month={month} year={year} />
          )}
        </View>

        <Text style={styles.sectionTitle}>Detail Mood Harian</Text>

        {loading ? (
          <View style={styles.detailLoading}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Memuat data mood...</Text>
          </View>
        ) : raw.length > 0 ? (
          raw.map((i: any) => (
            <View
              key={i.mood_id}
              style={[styles.detailItem, { borderLeftColor: i.color }]}
            >
              <Text style={styles.detailDate}>
                {dayjs(i.date).format("DD MMMM YYYY")}
              </Text>
              <Text>Mood: {i.mood}</Text>
              <Text style={styles.detailNote}>Catatan: {i.note ?? "-"}</Text>
            </View>
          ))
        ) : (
          <EmptyDetail />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  yearPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  yearArrow: {
    fontSize: 16,
    paddingHorizontal: 8,
  },

  yearText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 50,
    textAlign: "center",
  },

  monthScroll: {
    paddingVertical: 4,
  },

  monthItem: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    height: 36,
    paddingHorizontal: 16,
    marginRight: 10,
  },

  monthItemActive: {
    backgroundColor: "#4F46E5",
    elevation: 3,
  },

  monthText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },

  monthTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.85,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  emptyDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  loadingText: {
    marginTop: 8,
    color: "#64748B",
  },

  chartWrapper: {
    height: 260,
    marginBottom: 16,
  },

  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 1,
    overflow: "hidden",
  },

  chartLoading: {
    height: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyChart: {
    height: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },

  emptyIconSmall: {
    fontSize: 32,
    marginBottom: 8,
  },

  emptyHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  emptySub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },

  emptySubCenter: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },

  emptyDetail: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 14,
    marginTop: 70,
  },

  detailLoading: {
    height: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  detailItem: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 6,
    elevation: 1,
  },

  detailDate: {
    fontWeight: "600",
  },

  detailNote: {
    color: "#444",
  },
});
