# GeoWeather

# Weather Forecast & Location Tracking System
![React Native](https://img.shields.io/badge/REACT__NATIVE-EXPO__52.0.0-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/FIREBASE-V11.0-orange?style=for-the-badge&logo=firebase)
![Axios](https://img.shields.io/badge/AXIOS-V1.18.1-purple?style=for-the-badge&logo=axios)

> Laporan Ujian Praktikum Mobile Computing — Semester Genap 2025/2026

---

## 1. Identitas Tim & Pembagian Tugas

Dokumentasi ini disusun oleh Kelompok dengan rincian peran, tanggung jawab, dan pembagian tugas riil sebagai berikut:

| No | Nama Anggota | Peran | Tanggung Jawab & Detail Tugas |
| :--- | :--- | :--- | :--- |
| 1 | **Atta Rizal Aurel Fajri** | Frontend & UI/UX Specialist | Merancang seluruh tata letak visual antarmuka (DashboardScreen, Form Pencarian), sistem navigasi antarkomponen halaman menggunakan Expo Router, dan mengelola state lokal untuk visualisasi transisi data cuaca. |
| 2 | **Moh. Faiz Dwi Hermawan** | API & Network Specialist | Membangun gerbang komunikasi data asinkron menggunakan instance Axios terpusat, mengimplementasikan request/response interceptors untuk penanganan log otomatis, serta menyusun fungsi global error handling penanganan jaringan. |
| 3 | **Raihan Maulana Asyam** | Backend & Cloud Database Specialist | Mengintegrasikan SDK layanan Firebase, membangun sistem otentikasi pengguna berbasis email dan enkripsi password, serta menangani manipulasi operasi penulisan dan pengambilan data kota favorit secara real-time di Cloud Firestore. |

### Rincian Kontribusi (Bukti Git Commit)
* **Atta Rizal Aurel Fajri:** Implementasi struktur dasar layout visual, pemetaan komponen kartu informasi cuaca, manajemen state loading spinner, dan konfigurasi navigasi file-based routing.
* **Moh. Faiz Dwi Hermawan:** Integrasi API Open-Meteo, penyusunan arsitektur dasar Axios Client instance, pembuatan interceptor log terpusat, dan penanganan timeout response.
* **Raihan Maulana Asyam:** Konfigurasi SDK Firebase ke project inti, pembuatan fungsi pendaftaran akun (`createUserWithEmailAndPassword`), login (`signInWithEmailAndPassword`), serta pemetaan koleksi data Firestore kota favorit.

---

## 2. Deskripsi Aplikasi

**GeoWeather** adalah sistem pelacakan informasi cuaca dan manajemen lokasi favorit berbasis mobile yang dirancang khusus untuk memberikan pemantauan atmosferik secara real-time. Aplikasi ini mengintegrasikan fungsi utilitas internal perangkat dengan arsitektur jaringan cloud untuk memudahkan pencarian data cuaca di berbagai wilayah Indonesia secara efisien dan transparan.

Melalui aplikasi mobile ini, pengguna dapat melakukan autentikasi akun secara aman, mencari koordinat geografis suatu kota secara presisi, memantau komponen cuaca terkini (suhu, kelembapan udara, dan kecepatan angin), serta menandai dan menyimpan daftar wilayah pilihan ke dalam database cloud untuk kebutuhan pemantauan berkala secara real-time.

### Tech Stack Utama:
* **Framework:** React Native (Expo SDK ~52.0.0)
* **Backend-as-a-Service (BaaS):** Firebase v11.0 (Authentication & Cloud Firestore)
* **HTTP Client:** Axios v1.18.1
* **State & Navigation:** Expo Router & React Hooks (`useState`, `useEffect`)

---

## 3. Daftar API yang Digunakan

Aplikasi GeoWeather menggunakan dua jenis integrasi layanan jaringan eksternal:

| Nama API / Layanan | Endpoint / Metode | Kegunaan |
| :--- | :--- | :--- |
| **Open-Meteo Geocoding** | `GET https://geocoding-api.open-meteo.com/v1/search?name={cityName}&count=5&language=id&format=json` | Berfungsi mencari data koordinat geografis (latitude & longitude) berdasarkan nama kota input pencarian user menggunakan pustaka **Axios**. |
| **Open-Meteo Forecast** | `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto` | Mengambil metrik data cuaca real-time (suhu fisik, kelembaban, estimasi presipitasi hujan, dan kecepatan angin) dari parameter koordinat yang dikirimkan. |
| **Firebase Auth** | `Firebase SDK (auth)` | Mengelola sistem registrasi akun pengguna baru, validasi hak akses masuk (login), serta mempertahankan persistensi sesi pengguna aktif. |
| **Cloud Firestore** | `Firebase SDK (firestore)` | Database NoSQL utama untuk operasi penyimpanan daftar nama kota favorit yang ditandai oleh pengguna ke dalam sub-koleksi akun cloud secara permanen. |

---

## 4. Daftar 3 Fitur Utama (Alur Demo Penilaian)

Sesuai kriteria penilaian praktikum, berikut adalah 3 fitur utama yang diimplementasikan dan siap didemokan alur kodenya:

### Fitur 1 — Autentikasi Pengguna (Login & Register)
* **File Source:** `src/app/auth/register.tsx` & `src/app/auth/login.tsx`
* **Alur Demo:** Fitur pendaftaran akun menggunakan fungsi bawaan `createUserWithEmailAndPassword`. Setelah proses pendaftaran atau masuk tervalidasi via `signInWithEmailAndPassword`, sesi pengguna dikunci otomatis menggunakan listener global `onAuthStateChanged` agar user langsung diarahkan ke beranda utama setiap kali aplikasi dibuka kembali.
* **Penanggung Jawab:** Raihan Maulana Asyam

### Fitur 2 — Pencarian Data Cuaca Terintegrasi (Axios Interceptors)
* **File Source:** `src/services/weatherApi.ts` & `src/app/(tabs)/index.tsx`
* **Alur Demo:** Sistem mengambil input teks nama kota dari form, mengeksekusi request asinkron ke server Open-Meteo via Axios dengan konfigurasi batasan waktu respons *timeout* 10 detik. Seluruh proses pengiriman data dan pengembalian JSON response dicatat secara terpusat oleh fungsi interceptors untuk pelacakan log aktivitas jaringan.
* **Penanggung Jawab:** Moh. Faiz Dwi Hermawan

### Fitur 3 — Penyimpanan Kota Favorit (Cloud Firestore Storage)
* **File Source:** `src/services/favoriteService.ts` & `src/app/(tabs)/favorites.tsx`
* **Alur Demo:** Aplikasi mengeksekusi fungsi asinkron penulisan dokumen baru ke Cloud Firestore menggunakan metode penambahan data berbasis ID unik pengguna. Halaman favorites menyajikan rekap data kota pilihan secara real-time, di mana pengguna juga dapat melakukan penghapusan item koordinat favorit langsung dari memori database cloud.
* **Penanggung Jawab:** Atta Rizal Aurel Fajri

---

## 5. Struktur Arsitektur Kode Proyek

```text
geoweather-mobile/
├── App.js                         # Root file dan pintu gerbang utama aplikasi
├── src/
│   ├── app/                       # File-based routing menggunakan Expo Router
│   │   ├── _layout.tsx            # Konfigurasi layout global & Auth Listener
│   │   ├── auth/
│   │   │   ├── login.tsx          # Fitur 1: Antarmuka & Logika Masuk Akun
│   │   │   └── register.tsx       # Fitur 1: Antarmuka & Logika Daftar Akun
│   │   └── (tabs)/
│   │       ├── index.tsx          # Fitur 2: Layar Form Pencarian & Dashboard Cuaca
│   │       └── favorites.tsx      # Fitur 3: Layar Manajemen Daftar Kota Favorit
│   ├── components/
│   │   ├── WeatherCard.tsx        # Komponen reusable visualisasi metrik cuaca
│   │   └── LoadingOverlay.tsx     # Komponen reusable indikator transisi pemanggilan data
│   ├── hooks/
│   │   └── use-theme.ts           # Logika pemetaan tema warna aplikasi
│   ├── services/
│   │   ├── firebaseConfig.ts      # Berkas inisialisasi kredensial SDK Firebase
│   │   ├── favoriteService.ts     # Logika manipulasi data favorit di Cloud Firestore
│   │   └── weatherApi.ts          # Konfigurasi dasar HTTP Client & Interceptor Axios
│   └── constants/
│       └── Colors.ts              # Palet kode warna global visual antarmuka
├── package.json                   # Konfigurasi dependensi library pihak ketiga
└── README.md                      # Berkas dokumentasi utama proyek