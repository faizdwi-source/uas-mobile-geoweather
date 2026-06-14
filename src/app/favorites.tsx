import { router, useFocusEffect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auth } from "../../firebaseConfig";
import {
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";
import type {
  FavoriteCity,
} from "../services/favoriteService";

type NotificationType = "warning" | "success";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notificationVisible, setNotificationVisible] =
    useState(false);
  const [notificationTitle, setNotificationTitle] =
    useState("Warning");
  const [notificationMessage, setNotificationMessage] =
    useState("");
  const [notificationType, setNotificationType] =
    useState<NotificationType>("warning");

  const tampilkanNotifikasi = (
    title: string,
    message: string,
    type: NotificationType
  ) => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationType(type);
    setNotificationVisible(true);
  };

  const tampilkanWarning = (message: string) => {
    tampilkanNotifikasi("Warning", message, "warning");
  };

  const tampilkanBerhasil = (message: string) => {
    tampilkanNotifikasi("Berhasil", message, "success");
  };

  const loadFavorites = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/");
      return;
    }

    try {
      setLoading(true);

      const data = await getFavorites(user.uid);

      data.sort((a, b) => a.name.localeCompare(b.name));
      setFavorites(data);
    } catch (error: unknown) {
      console.log("Load favorites error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Daftar favorit gagal dimuat.";

      tampilkanWarning(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.replace("/");
          return;
        }

        void loadFavorites();
      });

      return unsubscribe;
    }, [loadFavorites])
  );

  const prosesHapus = async (favorite: FavoriteCity) => {
    const user = auth.currentUser;

    if (!user) {
      tampilkanWarning(
        "Sesi pengguna tidak ditemukan. Silakan login kembali."
      );
      return;
    }

    try {
      setDeletingId(favorite.id);

      await removeFavorite(user.uid, favorite.id);

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (item) => item.id !== favorite.id
        )
      );

      tampilkanBerhasil(
        `${favorite.name} berhasil dihapus dari daftar favorit.`
      );
    } catch (error: unknown) {
      console.log("Remove favorite error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Kota gagal dihapus dari daftar favorit.";

      tampilkanWarning(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (favorite: FavoriteCity) => {
    if (Platform.OS === "web") {
      const setuju = window.confirm(
        `Hapus ${favorite.name} dari daftar favorit?`
      );

      if (setuju) {
        void prosesHapus(favorite);
      }

      return;
    }

    Alert.alert(
      "Hapus favorit",
      `Hapus ${favorite.name} dari daftar favorit?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            void prosesHapus(favorite);
          },
        },
      ]
    );
  };

  const getWeatherInformation = (code: number) => {
    if (code === 0) {
      return {
        icon: "☀️",
        description: "Cerah",
      };
    }

    if (code >= 1 && code <= 3) {
      return {
        icon: "⛅",
        description: "Berawan",
      };
    }

    if (code === 45 || code === 48) {
      return {
        icon: "🌫️",
        description: "Berkabut",
      };
    }

    if (code >= 51 && code <= 57) {
      return {
        icon: "🌦️",
        description: "Gerimis",
      };
    }

    if (code >= 61 && code <= 67) {
      return {
        icon: "🌧️",
        description: "Hujan",
      };
    }

    if (code >= 71 && code <= 77) {
      return {
        icon: "❄️",
        description: "Salju",
      };
    }

    if (code >= 80 && code <= 82) {
      return {
        icon: "🌧️",
        description: "Hujan deras",
      };
    }

    if (code >= 85 && code <= 86) {
      return {
        icon: "🌨️",
        description: "Hujan salju",
      };
    }

    if (code >= 95 && code <= 99) {
      return {
        icon: "⛈️",
        description: "Badai petir",
      };
    }

    return {
      icon: "🌤️",
      description: "Cuaca tidak diketahui",
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Kota Favorit
            </Text>

            <Text style={styles.subtitle}>
              Lokasi cuaca yang disimpan di Cloud Firestore
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.backButtonText}>
              Kembali
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator
              size="large"
              color="#1565c0"
            />

            <Text style={styles.stateText}>
              Memuat daftar favorit...
            </Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emptyIcon}>
              ⭐
            </Text>

            <Text style={styles.emptyTitle}>
              Belum ada kota favorit
            </Text>

            <Text style={styles.stateText}>
              Kembali ke halaman cuaca, cari kota, lalu tekan
              Simpan ke Favorit.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.replace("/home")}
            >
              <Text style={styles.primaryButtonText}>
                Cari Kota
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {favorites.map((favorite) => {
              const weatherInformation =
                getWeatherInformation(
                  favorite.weatherCode
                );

              return (
                <View
                  key={favorite.id}
                  style={styles.favoriteCard}
                >
                  <View style={styles.weatherIconContainer}>
                    <Text style={styles.weatherIcon}>
                      {weatherInformation.icon}
                    </Text>
                  </View>

                  <View style={styles.favoriteInformation}>
                    <Text style={styles.cityName}>
                      {favorite.name}
                    </Text>

                    <Text style={styles.cityLocation}>
                      {[favorite.admin1, favorite.country]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>

                    <Text style={styles.weatherDescription}>
                      {weatherInformation.description}
                    </Text>

                    <Text style={styles.coordinateText}>
                      {favorite.latitude}, {favorite.longitude}
                    </Text>
                  </View>

                  <View style={styles.rightInformation}>
                    <Text style={styles.temperature}>
                      {favorite.temperature}°C
                    </Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.deleteButton,
                        pressed && styles.buttonPressed,
                        deletingId === favorite.id &&
                          styles.buttonDisabled,
                      ]}
                      onPress={() =>
                        handleDelete(favorite)
                      }
                      disabled={
                        deletingId === favorite.id
                      }
                    >
                      {deletingId === favorite.id ? (
                        <ActivityIndicator
                          color="#ffffff"
                          size="small"
                        />
                      ) : (
                        <Text
                          style={styles.deleteButtonText}
                        >
                          Hapus
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={notificationVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setNotificationVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.notificationIconContainer,
                notificationType === "success"
                  ? styles.successIconContainer
                  : styles.warningIconContainer,
              ]}
            >
              <Text
                style={[
                  styles.notificationIconText,
                  notificationType === "success"
                    ? styles.successIconText
                    : styles.warningIconText,
                ]}
              >
                {notificationType === "success"
                  ? "✓"
                  : "!"}
              </Text>
            </View>

            <Text
              style={[
                styles.modalTitle,
                notificationType === "success"
                  ? styles.successTitle
                  : styles.warningTitle,
              ]}
            >
              {notificationTitle}
            </Text>

            <Text style={styles.modalMessage}>
              {notificationMessage}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
                setNotificationVisible(false)
              }
            >
              <Text style={styles.modalButtonText}>
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef6ff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 22,
  },
  headerCard: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    backgroundColor: "#1565c0",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 5,
    color: "#e3f2fd",
    fontSize: 14,
  },
  backButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  listContainer: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    marginTop: 20,
  },
  favoriteCard: {
    width: "100%",
    marginBottom: 14,
    padding: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e7ec",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eef6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  weatherIcon: {
    fontSize: 34,
  },
  favoriteInformation: {
    flex: 1,
    marginHorizontal: 15,
  },
  cityName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1565c0",
  },
  cityLocation: {
    marginTop: 3,
    fontSize: 13,
    color: "#78909c",
  },
  weatherDescription: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: "600",
    color: "#455a64",
  },
  coordinateText: {
    marginTop: 5,
    fontSize: 12,
    color: "#90a4ae",
  },
  rightInformation: {
    minWidth: 90,
    alignItems: "flex-end",
  },
  temperature: {
    fontSize: 23,
    fontWeight: "700",
    color: "#263238",
  },
  deleteButton: {
    minWidth: 78,
    minHeight: 38,
    marginTop: 12,
    borderRadius: 9,
    backgroundColor: "#d32f2f",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  stateCard: {
    width: "100%",
    maxWidth: 760,
    minHeight: 260,
    alignSelf: "center",
    marginTop: 20,
    padding: 30,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e7ec",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 58,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 21,
    fontWeight: "700",
    color: "#37474f",
    textAlign: "center",
  },
  stateText: {
    maxWidth: 430,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#78909c",
    textAlign: "center",
  },
  primaryButton: {
    minWidth: 160,
    minHeight: 48,
    marginTop: 22,
    borderRadius: 10,
    backgroundColor: "#1565c0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 26,
    alignItems: "center",
  },
  notificationIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  warningIconContainer: {
    backgroundColor: "#ffebee",
  },
  successIconContainer: {
    backgroundColor: "#e8f5e9",
  },
  notificationIconText: {
    fontSize: 34,
    fontWeight: "800",
  },
  warningIconText: {
    color: "#d32f2f",
  },
  successIconText: {
    color: "#2e7d32",
  },
  modalTitle: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "700",
  },
  warningTitle: {
    color: "#d32f2f",
  },
  successTitle: {
    color: "#2e7d32",
  },
  modalMessage: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#455a64",
    textAlign: "center",
  },
  modalButton: {
    width: "100%",
    minHeight: 46,
    marginTop: 23,
    borderRadius: 10,
    backgroundColor: "#1565c0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
