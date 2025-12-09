import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getTodayMood } from "../../api/moodApi";

export default function HomeScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [todayMood, setTodayMood] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  };

  const loadTodayMood = async () => {
    try {
      const res = await getTodayMood();
      setTodayMood(res || null);
    } catch (err) {
      console.log("Error load today mood:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadTodayMood();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halo, {user?.name || "User"}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood Hari Ini</Text>

        {todayMood ? (
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <View
                style={[
                  styles.moodCircle,
                  { backgroundColor: todayMood.color },
                ]}
              />
              <View>
                <Text style={styles.moodLabel}>{todayMood.mood}</Text>
                <Text style={styles.moodDate}>
                  {dayjs(todayMood.date).format("DD MMM YYYY")}
                </Text>
              </View>
            </View>

            {todayMood.note ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.noteLabel}>Catatan:</Text>
                <Text style={styles.noteText}>{todayMood.note}</Text>
              </>
            ) : (
              <>
                <View style={styles.divider} />
                <Text style={{ color: "#6b728080", fontStyle: "italic" }}>
                  Tidak ada catatan hari ini
                </Text>
              </>
            )}
          </View>
        ) : (
          <Text style={{ color: "#6b7280" }}>
            Kamu belum mengisi mood hari ini
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/mood/edit")}
      >
        <Text style={styles.buttonText}>
          {todayMood ? "Ubah Mood Hari Ini" : "Isi Mood Hari Ini"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  moodWrapper: { flexDirection: "row", alignItems: "center", gap: 10 },
  moodColor: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  moodText: { fontSize: 16 },
  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "white", textAlign: "center", fontSize: 16 },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
  },
  secondaryText: {
    textAlign: "center",
    fontSize: 16,
    color: "#374151",
  },

  moodCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  moodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 15,
  },

  moodCircle: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  moodLabel: {
    fontSize: 20,
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
    marginVertical: 10,
  },

  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  noteText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
