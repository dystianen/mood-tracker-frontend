import Recommendation from "@/components/Recommendation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getRecommendation, getTodayMood } from "../../api/moodApi";

type MoodType =
  | "Sangat Senang"
  | "Senang"
  | "Biasa Saja"
  | "Sedih"
  | "Sangat Sedih";

const moodEmoji: Record<MoodType, string> = {
  "Sangat Senang": "😄",
  Senang: "🙂",
  "Biasa Saja": "😐",
  Sedih: "😔",
  "Sangat Sedih": "😢",
};
interface TodayMood {
  mood: MoodType;
  color: string;
  date: string;
  note?: string;
}

export default function HomeScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [todayMood, setTodayMood] = useState<TodayMood | null>(null);
  const [loadingTodayMood, setLoadingTodayMood] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadUser(),
        loadTodayMood(true),
        loadRecommendationMood(true),
      ]);
    } catch (err) {
      console.log("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  };

  const loadTodayMood = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingTodayMood(true);
      }

      const res = await getTodayMood();
      setTodayMood(res || null);
    } catch (err) {
      console.log("Error load today mood:", err);
    } finally {
      setLoadingTodayMood(false);
    }
  };

  const loadRecommendationMood = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingRecommendation(true);
      }

      const month = dayjs().month() + 1;
      const year = dayjs().year();
      const res = await getRecommendation(month, year);
      setRecommendation(res);
      setLoadingRecommendation(false);
    } catch (err) {
      console.log("Error load today mood:", err);
      setLoadingRecommendation(false);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadTodayMood();
    loadRecommendationMood();
  }, []);

  const EmptyRecommendation = () => {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Rekomendasi</Text>
        <Text style={styles.emptyDescription}>
          Belum ada rekomendasi untuk periode ini. Isi mood kamu secara rutin
          agar kami bisa memberikan saran yang lebih relevan ✨
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#6366F1"]}
          tintColor="#6366F1"
        />
      }
    >
      <Text style={styles.title}>Halo, {user?.name || "User"} 👋</Text>
      <Text style={styles.subtitle}>Semoga harimu menyenangkan</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood Hari Ini</Text>

        {loadingTodayMood ? (
          <View style={styles.moodLoadingCard}>
            <ActivityIndicator size="small" color="#6366F1" />
            <Text style={styles.loadingText}>Memuat mood hari ini...</Text>
          </View>
        ) : todayMood ? (
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <View
                style={[
                  styles.moodCircle,
                  { backgroundColor: todayMood.color },
                ]}
              />
              <View>
                <Text style={styles.moodLabel}>
                  {todayMood.mood} {moodEmoji[todayMood.mood]}
                </Text>
                <Text style={styles.moodDate}>
                  {dayjs(todayMood.date).format("DD MMM YYYY")}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {todayMood.note ? (
              <>
                <Text style={styles.noteLabel}>Catatan</Text>
                <Text style={styles.noteText}>“{todayMood.note}”</Text>
              </>
            ) : (
              <Text style={styles.emptyNote}>Tidak ada catatan hari ini</Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>Kamu belum mengisi mood hari ini</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/mood/edit")}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {todayMood ? "Ubah Mood Hari Ini" : "Isi Mood Hari Ini"}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Rekomendasi Berdasarkan Mood Bulan Ini
        </Text>

        {loadingRecommendation ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#6366F1" />
            <Text style={styles.loadingText}>Memuat rekomendasi...</Text>
          </View>
        ) : recommendation ? (
          <Recommendation data={recommendation} />
        ) : (
          <EmptyRecommendation />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "#F5F7FA",
  },

  contentContainer: {
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  moodCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  moodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  moodCircle: {
    width: 42,
    height: 42,
    borderRadius: 50,
  },

  moodLabel: {
    fontSize: 18,
    fontWeight: "700",
  },

  moodDate: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },

  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#374151",
  },

  noteText: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
    lineHeight: 20,
  },

  emptyNote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#9ca3af",
  },

  emptyText: {
    color: "#6b7280",
    fontStyle: "italic",
  },

  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    height: 150,
    elevation: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  moodLoadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
    height: 150,
  },

  // Loading Recommendation
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
});
