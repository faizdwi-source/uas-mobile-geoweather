import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth } from "../../firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [warningVisible, setWarningVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const tampilkanWarning = (pesan: string) => {
    setWarningMessage(pesan);
    setWarningVisible(true);
  };

  const tutupWarning = () => {
    setWarningVisible(false);
  };

  const handleLogin = async () => {
    const emailBersih = email.trim().toLowerCase();

    if (!emailBersih || !password) {
      tampilkanWarning("Masukkan email dan password.");
      return;
    }

    try {
      setLoading(true);
      
// LOGIN
      await signInWithEmailAndPassword(
        auth,
        emailBersih,
        password
      );

      router.replace("/home");
    } catch (error: any) {
      console.log("Kode login:", error.code);
      console.log("Pesan login:", error.message);

      let pesan = "Terjadi kesalahan. Silakan coba kembali.";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        pesan = "Email atau password salah.";
      } else if (error.code === "auth/invalid-email") {
        pesan = "Format email tidak valid.";
      } else if (error.code === "auth/user-disabled") {
        pesan = "Akun ini telah dinonaktifkan.";
      } else if (error.code === "auth/too-many-requests") {
        pesan =
          "Terlalu banyak percobaan login. Silakan coba kembali beberapa saat lagi.";
      } else if (error.code === "auth/network-request-failed") {
        pesan =
          "Koneksi internet bermasalah. Periksa koneksi.";
      } else if (error.code === "auth/api-key-not-valid") {
        pesan =
          "Konfigurasi Firebase tidak valid. Periksa API key Firebase.";
      }

      tampilkanWarning(pesan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>☁</Text>
          </View>

          <Text style={styles.title}>GeoWeather</Text>

          <Text style={styles.subtitle}>
            Masuk untuk melihat cuaca dan menyimpan lokasi favorit.
          </Text>

          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="contoh@email.com"
            placeholderTextColor="#90a4ae"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Minimal 6 karakter"
            placeholderTextColor="#90a4ae"
            secureTextEntry
            editable={!loading}
            onSubmitEditing={handleLogin}
          />

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Masuk
              </Text>
            )}
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Belum memiliki akun?
            </Text>

            <Pressable
              onPress={() => router.push("/register")}
              disabled={loading}
            >
              <Text style={styles.registerLink}>
                Daftar sekarang
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={warningVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={tutupWarning}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIcon}>
              <Text style={styles.warningIconText}>!</Text>
            </View>

            <Text style={styles.modalTitle}>Warning</Text>

            <Text style={styles.modalMessage}>
              {warningMessage}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={tutupWarning}
            >
              <Text style={styles.modalButtonText}>OK</Text>
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
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 28,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 36,
  },
  logoText: {
    fontSize: 38,
  },
  title: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: "700",
    color: "#1565c0",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    color: "#607d8b",
    textAlign: "center",
  },
  label: {
    marginBottom: 7,
    fontSize: 14,
    fontWeight: "600",
    color: "#37474f",
  },
  input: {
    minHeight: 50,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#263238",
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "#1565c0",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerContainer: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  registerText: {
    color: "#607d8b",
  },
  registerLink: {
    color: "#1565c0",
    fontWeight: "700",
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
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  warningIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#ffebee",
    alignItems: "center",
    justifyContent: "center",
  },
  warningIconText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#d32f2f",
  },
  modalTitle: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "700",
    color: "#d32f2f",
    textAlign: "center",
  },
  modalMessage: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
    color: "#455a64",
    textAlign: "center",
  },
  modalButton: {
    width: "100%",
    minHeight: 46,
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: "#1565c0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});