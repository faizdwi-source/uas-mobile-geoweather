import { router } from "expo-router";
import {createUserWithEmailAndPassword,signOut,} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth, db } from "../../firebaseConfig";

export default function RegisterScreen() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] =
    useState("");
  const [loading, setLoading] = useState(false);

const handleRegister = async () => {
  const namaBersih = nama.trim();
  const emailBersih = email.trim().toLowerCase();

  if (
    !namaBersih ||
    !emailBersih ||
    !password ||
    !konfirmasiPassword
  ) {
    const pesan = "Mohon isi semua kolom terlebih dahulu!";

    if (Platform.OS === "web") {
      window.alert(pesan);
    } else {
      Alert.alert("Terdapat Data yanng belum lengkap", pesan);
    }

    return;
  }

  if (password.length < 6) {
    const pesan = "Password harus berisi minimal 6 karakter.";

    if (Platform.OS === "web") {
      window.alert(pesan);
    } else {
      Alert.alert("Password terlalu pendek", pesan);
    }

    return;
  }

  if (password !== konfirmasiPassword) {
    const pesan =
      "Konfirmasi password harus sama dengan password.";

    if (Platform.OS === "web") {
      window.alert(pesan);
    } else {
      Alert.alert("Password tidak sama", pesan);
    }

    return;
  }

  try {
    setLoading(true);

    // REGISTER
// membuat akun baru di Firebase Authentication.
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        emailBersih,
        password
      );

    const user = userCredential.user;

// Profil pengguna juga disimpan ke Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      nama: namaBersih,
      email: emailBersih,
      dibuatPada: serverTimestamp(),
    });

    // Firebase otomatis membuat pengguna langsung login.
    // Logout agar pengguna kembali ke halaman login.
    await signOut(auth);

    if (Platform.OS === "web") {
      window.alert(
        "Pendaftaran berhasil. Harap login menggunakan email dan password Anda."
      );

      router.replace("/");
    } else {
      Alert.alert(
        "Pendaftaran berhasil",
        "Silakan login menggunakan email dan password Anda.",
        [
          {
            text: "Ke halaman login",
            onPress: () => router.replace("/"),
          },
        ]
      );
    }
  } catch (error: any) {
    console.log("Kode register:", error.code);
    console.log("Pesan register:", error.message);

    let judul = "Pendaftaran gagal";
    let pesan = "Akun gagal dibuat. Silakan coba kembali.";

    if (error.code === "auth/email-already-in-use") {
      judul = "Email sudah terdaftar";
      pesan =
        "Email tersebut sudah digunakan. Silakan masuk melalui halaman login.";
    } else if (error.code === "auth/invalid-email") {
      pesan = "Format email tidak valid.";
    } else if (error.code === "auth/weak-password") {
      pesan = "Password harus berisi minimal 6 karakter.";
    } else if (error.code === "auth/network-request-failed") {
      pesan = "Koneksi internet bermasalah.";
    } else if (error.code === "permission-denied") {
      pesan =
        "Akun berhasil dibuat, tetapi profil gagal disimpan ke Firestore.";
    }

    if (Platform.OS === "web") {
      window.alert(`${judul}\n\n${pesan}`);
    } else {
      Alert.alert(judul, pesan);
    }
  } finally {
    setLoading(false);
  }
};   const namaBersih = nama.trim();
    const emailBersih = email.trim();

    

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Buat Akun</Text>

            <Text style={styles.subtitle}>
              Daftar untuk menggunakan GeoWeather.
            </Text>

            <Text style={styles.label}>Nama lengkap</Text>

            <TextInput
              style={styles.input}
              value={nama}
              onChangeText={setNama}
              placeholder="Masukkan nama lengkap"
            />

            <Text style={styles.label}>Email</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="contoh@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 6 karakter"
              secureTextEntry
            />

            <Text style={styles.label}>
              Konfirmasi password
            </Text>

            <TextInput
              style={styles.input}
              value={konfirmasiPassword}
              onChangeText={setKonfirmasiPassword}
              placeholder="Masukkan kembali password"
              secureTextEntry
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Daftar
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.loginButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.loginText}>
                Sudah memiliki akun? Masuk
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1565c0",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
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
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#263238",
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 5,
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
  loginButton: {
    marginTop: 18,
    padding: 8,
    alignItems: "center",
  },
  loginText: {
    color: "#1565c0",
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});