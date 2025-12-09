import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }

    setChecking(false);
  };

  useEffect(() => {
    checkLogin();
  }, []);

  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
