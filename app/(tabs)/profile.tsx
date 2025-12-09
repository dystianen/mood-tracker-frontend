import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("Error loading user:", error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    router.replace("/(auth)/login");
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: "#888" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.header}>
        <Image
          source={{
            uri: user.avatar || "https://i.pravatar.cc/200",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Card Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi Akun</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>Active</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 100,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#777",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#444",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  logoutBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
