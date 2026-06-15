import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth } from "../../firebaseConfig";
import { saveFavorite } from "../services/favoriteService";
import {
  getCurrentWeather,
  searchCity,
} from "../services/weatherApi";
import type {
  CityResult,
  WeatherResponse,
} from "../services/weatherApi";

type NotificationType = "warning" | "success";

export default function HomeScreen() {
  const [keyword, setKeyword] = useState("");
  const [selectedCity, setSelectedCity] =
    useState<CityResult | null>(null);
  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const [notificationVisible, setNotificationVisible] =
    useState(false);
  const [notificationTitle, setNotificationTitle] =
    useState("Warning");
  const [notificationMessage, setNotificationMessage] =
    useState("");
  const [notificationType, setNotificationType] =
    useState<NotificationType>("warning");
    
// Pemeriksaan sesi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
        return;
      }

      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

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

  const handleSearch = async () => {
    const namaKota = keyword.trim();

    if (!namaKota) {
      tampilkanWarning("Silahkan masukkan nama kota terlebih dahulu.");
      return;
    }

    if (namaKota.length < 2) {
      tampilkanWarning(
        "Nama kota harus terdiri dari minimal 2 karakter."
      );
      return;
    }

    try {
      setLoadingWeather(true);
      setSelectedCity(null);
      setWeather(null);

      const cityResults = await searchCity(namaKota);

      if (cityResults.length === 0) {
        tampilkanWarning(
          `Kota "${namaKota}" tidak ditemukan.`
        );
        return;
      }

      const city = cityResults[0];

      const weatherResult = await getCurrentWeather(
        city.latitude,
        city.longitude
      );

      setSelectedCity(city);
      setWeather(weatherResult);
    } catch (error: unknown) {
      console.log("Weather error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Data cuaca gagal diambil. Silakan coba kembali.";

      tampilkanWarning(message);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleSaveFavorite = async () => {
    const user = auth.currentUser;

    if (!user) {
      tampilkanWarning(
        "Sesi pengguna tidak ditemukan. Silakan login kembali."
      );
      return;
    }

    if (!selectedCity || !weather) {
      tampilkanWarning(
        "Cari kota terlebih dahulu sebelum menyimpan favorit."
      );
      return;
    }

    try {
      setSavingFavorite(true);

      await saveFavorite(
        user.uid,
        selectedCity,
        weather
      );

      tampilkanBerhasil(
        `${selectedCity.name} berhasil disimpan ke daftar favorit.`
      );
    } catch (error: unknown) {
      console.log("Favorite error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Kota gagal disimpan ke daftar favorit.";

      tampilkanWarning(message);
    } finally {
      setSavingFavorite(false);
    }
  };

  const prosesLogout = async () => {
    try 
    // LOGOUT
    {
      await signOut(auth);
      router.replace("/");
    } 
    catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Logout gagal. Silakan coba kembali.";

      tampilkanWarning(message);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const setuju = window.confirm(
        "Apakah Anda yakin ingin keluar?"
      );

      if (setuju) {
        void prosesLogout();
      }

      return;
    }

    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => {
            void prosesLogout();
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
      description: "Kondisi cuaca tidak diketahui",
    };
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator
          size="large"
          color="#1565c0"
        />
        <Text style={styles.loadingText}>
          Memeriksa sesi pengguna...
        </Text>
      </View>
    );
  }

  const weatherInformation = weather
    ? getWeatherInformation(
        weather.current.weather_code
      )
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCard}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.appName}>
                GeoWeather
              </Text>

              <Text style={styles.userEmail}>
                {auth.currentUser?.email}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.logoutHeaderButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutHeaderText}>
                Keluar
              </Text>
            </Pressable>
          </View>

          <View style={styles.searchCard}>
            <Text style={styles.searchTitle}>
              Cari cuaca kota
            </Text>

            <Text style={styles.searchDescription}>
              Masukkan nama kota untuk melihat kondisi cuaca
              terkini.
            </Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Contoh: Surabaya"
                placeholderTextColor="#90a4ae"
                autoCapitalize="words"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                editable={!loadingWeather}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.searchButton,
                  pressed && styles.buttonPressed,
                  loadingWeather &&
                    styles.buttonDisabled,
                ]}
                onPress={handleSearch}
                disabled={loadingWeather}
              >
                {loadingWeather ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.searchButtonText}>
                    Cari
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          {!weather && !loadingWeather && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🌍</Text>

              <Text style={styles.emptyTitle}>
                Belum ada data cuaca
              </Text>

              <Text style={styles.emptyDescription}>
                Cari nama kota untuk menampilkan suhu,
                kelembapan, angin, dan kondisi cuaca.
              </Text>
            </View>
          )}

          {loadingWeather && (
            <View style={styles.loadingCard}>
              <ActivityIndicator
                size="large"
                color="#1565c0"
              />

              <Text style={styles.loadingWeatherText}>
                Mengambil data cuaca...
              </Text>
            </View>
          )}

          {weather &&
            selectedCity &&
            weatherInformation && (
              <View style={styles.weatherCard}>
                <Text style={styles.weatherIcon}>
                  {weatherInformation.icon}
                </Text>

                <Text style={styles.cityName}>
                  {selectedCity.name}
                </Text>

                <Text style={styles.cityLocation}>
                  {[
                    selectedCity.admin1,
                    selectedCity.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>

                <Text style={styles.weatherDescription}>
                  {weatherInformation.description}
                </Text>

                <Text style={styles.temperature}>
                  {weather.current.temperature_2m}
                  {
                    weather.current_units
                      .temperature_2m
                  }
                </Text>

                <Text style={styles.feelsLike}>
                  Terasa seperti{" "}
                  {
                    weather.current
                      .apparent_temperature
                  }
                  {
                    weather.current_units
                      .apparent_temperature
                  }
                </Text>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>
                      💧
                    </Text>

                    <Text style={styles.detailLabel}>
                      Kelembapan
                    </Text>

                    <Text style={styles.detailValue}>
                      {
                        weather.current
                          .relative_humidity_2m
                      }
                      {
                        weather.current_units
                          .relative_humidity_2m
                      }
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>
                      💨
                    </Text>

                    <Text style={styles.detailLabel}>
                      Kecepatan angin
                    </Text>

                    <Text style={styles.detailValue}>
                      {
                        weather.current
                          .wind_speed_10m
                      }{" "}
                      {
                        weather.current_units
                          .wind_speed_10m
                      }
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>
                      🌧️
                    </Text>

                    <Text style={styles.detailLabel}>
                      Curah hujan
                    </Text>

                    <Text style={styles.detailValue}>
                      {weather.current.precipitation}
                      {
                        weather.current_units
                          .precipitation
                      }
                    </Text>
                  </View>
                </View>

                <View style={styles.coordinateContainer}>
                  <Text style={styles.coordinateText}>
                    Latitude: {selectedCity.latitude}
                  </Text>

                  <Text style={styles.coordinateText}>
                    Longitude: {selectedCity.longitude}
                  </Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.favoriteButton,
                    pressed && styles.buttonPressed,
                    savingFavorite &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleSaveFavorite}
                  disabled={savingFavorite}
                >
                  {savingFavorite ? (
                    <ActivityIndicator
                      color="#ffffff"
                    />
                  ) : (
                    <Text
                      style={styles.favoriteButtonText}
                    >
                      ⭐ Simpan ke Favorit
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.viewFavoritesButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => router.push("/favorites")}
                >
                  <Text
                    style={styles.viewFavoritesButtonText}
                  >
                    ⭐ Lihat Daftar Favorit
                  </Text>
                </Pressable>
              </View>
            )}
        </ScrollView>
      </KeyboardAvoidingView>

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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 22,
  },
  loadingPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef6ff",
  },
  loadingText: {
    marginTop: 12,
    color: "#607d8b",
    fontSize: 15,
  },
  headerCard: {
    width: "100%",
    maxWidth: 700,
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
  appName: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "700",
  },
  userEmail: {
    marginTop: 5,
    color: "#e3f2fd",
    fontSize: 14,
  },
  logoutHeaderButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutHeaderText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  searchCard: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    marginTop: 20,
    padding: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e7ec",
    borderRadius: 18,
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1565c0",
  },
  searchDescription: {
    marginTop: 6,
    color: "#607d8b",
    fontSize: 14,
    lineHeight: 21,
  },
  searchContainer: {
    marginTop: 18,
    flexDirection: "row",
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 11,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    color: "#263238",
    fontSize: 15,
  },
  searchButton: {
    minWidth: 90,
    minHeight: 50,
    marginLeft: 10,
    borderRadius: 11,
    backgroundColor: "#1565c0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  favoriteButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 22,
    borderRadius: 12,
    backgroundColor: "#f9a825",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  favoriteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  viewFavoritesButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1565c0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  viewFavoritesButtonText: {
    color: "#1565c0",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyCard: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    marginTop: 20,
    padding: 35,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e7ec",
    borderRadius: 18,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 58,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#37474f",
  },
  emptyDescription: {
    maxWidth: 450,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#78909c",
    textAlign: "center",
  },
  loadingCard: {
    width: "100%",
    maxWidth: 700,
    minHeight: 180,
    alignSelf: "center",
    marginTop: 20,
    padding: 30,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingWeatherText: {
    marginTop: 13,
    color: "#607d8b",
    fontSize: 15,
  },
  weatherCard: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    marginTop: 20,
    padding: 28,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e7ec",
    borderRadius: 18,
    alignItems: "center",
  },
  weatherIcon: {
    fontSize: 75,
  },
  cityName: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: "700",
    color: "#1565c0",
    textAlign: "center",
  },
  cityLocation: {
    marginTop: 4,
    color: "#78909c",
    fontSize: 14,
    textAlign: "center",
  },
  weatherDescription: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "600",
    color: "#455a64",
  },
  temperature: {
    marginTop: 6,
    fontSize: 48,
    fontWeight: "700",
    color: "#263238",
  },
  feelsLike: {
    color: "#78909c",
    fontSize: 14,
  },
  detailsContainer: {
    width: "100%",
    marginTop: 27,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  detailItem: {
    minWidth: 150,
    flexGrow: 1,
    margin: 5,
    borderRadius: 13,
    backgroundColor: "#f4f8fc",
    padding: 16,
    alignItems: "center",
  },
  detailIcon: {
    fontSize: 27,
  },
  detailLabel: {
    marginTop: 7,
    color: "#78909c",
    fontSize: 13,
    textAlign: "center",
  },
  detailValue: {
    marginTop: 4,
    color: "#263238",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  coordinateContainer: {
    width: "100%",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eceff1",
    paddingTop: 16,
    alignItems: "center",
  },
  coordinateText: {
    marginTop: 3,
    fontSize: 13,
    color: "#78909c",
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
