import { createMood, getTodayMood, updateMood } from "@/api/moodApi";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const moodOptions = [
  {
    label: "Sangat Senang",
    color: "#4CAF50",
    description: "Perasaan sangat bahagia dan penuh energi positif.",
  },
  {
    label: "Senang",
    color: "#8BC34A",
    description: "Mood positif, merasa nyaman dan baik.",
  },
  {
    label: "Biasa Saja",
    color: "#FFC107",
    description: "Mood netral, tidak senang dan tidak sedih.",
  },
  {
    label: "Sedih",
    color: "#FF9800",
    description: "Kurang semangat atau sedikit kecewa.",
  },
  {
    label: "Sangat Sedih",
    color: "#F44336",
    description: "Perasaan berat atau sedih mendalam.",
  },
];

export type TTodayMood = {
  mood_id: string;
  date: string;
  color: string;
  mood: string;
  note: string;
};

export default function MoodCreate() {
  const router = useRouter();
  const [todayMood, setTodayMood] = useState<TTodayMood | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMood = async () => {
      try {
        setLoading(true);
        const res = await getTodayMood();
        if (res) {
          setTodayMood(res);
          setSelectedColor(res.color);
          setNote(res.note || "");
        } else {
          setTodayMood(null);
          setSelectedColor(null);
          setNote("");
        }
      } catch (error) {
        console.log("Error loading today's mood:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMood();
  }, []);

  const handleSubmit = async () => {
    if (!selectedColor) {
      Alert.alert("Oops!", "Kamu harus memilih warna mood dulu ya 😊");
      return;
    }

    try {
      setLoading(true);

      if (todayMood) {
        await updateMood(todayMood.mood_id, {
          date: todayMood.date,
          color: selectedColor,
          mood: moodOptions.find((c) => c.color === selectedColor)?.label,
          note: note,
        });
      } else {
        await createMood({
          date: dayjs().format("YYYY-MM-DD"),
          color: selectedColor,
          mood: moodOptions.find((c) => c.color === selectedColor)?.label,
          note,
        });
      }

      Alert.alert(
        "Berhasil",
        todayMood ? "Mood diperbarui! ✨" : "Mood disimpan! ✨",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.messages || err?.response?.data?.message;

      if (msg === "Mood for this date already exists") {
        Alert.alert(
          "Info",
          "Kamu sudah mengisi mood untuk hari ini. Silakan ubah mood dari halaman utama."
        );
        return;
      }

      Alert.alert("Error", msg || "Gagal menyimpan mood. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pilih Mood Hari Ini</Text>

      {/* PILIHAN WARNA CIRCLE */}
      <View style={styles.colorsContainer}>
        {moodOptions.map((item) => (
          <TouchableOpacity
            key={item.color}
            style={[
              styles.colorCircle,
              { backgroundColor: item.color },
              selectedColor === item.color && styles.selectedColor,
            ]}
            onPress={() => setSelectedColor(item.color)}
          />
        ))}
      </View>

      {/* PENJELASAN ARTI MOOD */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Arti Mood Berdasarkan Warna</Text>

        {moodOptions.map((item) => (
          <View key={item.color} style={styles.infoItem}>
            <View
              style={[styles.circleSmall, { backgroundColor: item.color }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoDesc}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CATATAN */}
      <Text style={styles.label}>Catatan (Opsional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Tulis sesuatu tentang hari kamu..."
        value={note}
        onChangeText={setNote}
        multiline
      />

      <TouchableOpacity
        style={[
          styles.btnSubmit,
          !selectedColor && { backgroundColor: "#ccc" },
        ]}
        disabled={!selectedColor || loading}
        onPress={handleSubmit}
      >
        <Text style={styles.btnText}>
          {loading ? "Menyimpan..." : "Simpan Mood"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 50, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 15 },

  /* PILIHAN WARNA */
  colorsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  colorCircle: {
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#4f46e5",
    borderWidth: 2,
  },

  /* INFO / PENJELASAN */
  infoBox: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  infoItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },

  circleSmall: {
    width: 18,
    height: 18,
    borderRadius: 50,
    marginRight: 12,
  },
  infoLabel: { fontSize: 15, fontWeight: "600" },
  infoDesc: { fontSize: 13, color: "#555" },

  /* CATATAN */
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    borderColor: "#ccc",
    textAlignVertical: "top",
  },

  /* BUTTON */
  btnSubmit: {
    marginTop: 20,
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
