# 🌦️ GeoWeather Mobile App

GeoWeather adalah aplikasi mobile berbasis React Native (Expo) yang dirancang untuk memberikan informasi perkiraan cuaca secara real-time dan akurat berdasarkan pencarian lokasi kota di Indonesia. 

Aplikasi ini mengintegrasikan **Open-Meteo API** menggunakan library **Axios** untuk penarikan data cuaca dan koordinat secara dinamis, serta memanfaatkan **Google Firebase** sebagai infrastruktur Backend-as-a-Service (BaaS) untuk mengelola manajemen autentikasi akun pengguna dan sinkronisasi database cloud secara real-time.

---

## 👥 Nama Anggota Kelompok & Pembagian Tugas

Sesuai dengan ketentuan **Skenario A (Tim Berisi 3 Orang)**, berikut adalah detail pembagian peran, tugas teknis, beserta tanggung jawab demo untuk masing-masing anggota kelompok:

| Peran | Anggota Tim | Deskripsi Tugas & Tanggung Jawab Demo |
| :--- | :--- | :--- |
| **Anggota 1: UI/UX & State Specialist** *(Frontend Developer)* | **[Atta Rizal Aurel Fajri]** | - Merancang seluruh tata letak (layout) UI aplikasi agar responsif.<br>- Memastikan sistem navigasi antar halaman berjalan lancar.<br>- Mengelola state aplikasi untuk rendering komponen data cuaca.<br>- **Tanggung Jawab Demo:** Menjelaskan layout UI, komponen visual, dan alur navigasi halaman utama. |
| **Anggota 2: API & Network Specialist** *(Axios Integrator)* | **[Moh. Faiz Dwi Hermawan]** | - Membangun koneksi HTTP Client menggunakan Axios Instance terpusat.<br>- Menangani request/response interceptor dan fungsi log terpusat.<br>- Mengimplementasikan mekanisme error handling dan batas waktu (timeout).<br>- **Tanggung Jawab Demo:** Menjelaskan alur pemanggilan data cuaca dan parsing JSON otomatis via Axios. |
| **Anggota 3: Cloud Database & Auth Specialist** *(Firebase Integrator)* | **[Raihan Maulana Asyam]** | - Melakukan setup awal konfigurasi SDK Firebase ke dalam proyek mobile.<br>- Membangun fitur manajemen autentikasi akun (Register & Login).<br>- Mengelola manipulasi penyimpanan data kota favorit ke Cloud Firestore.<br>- **Tanggung Jawab Demo:** Menjelaskan arsitektur auth, penulisan data Firestore, dan manajemen sesi user. |

---

## ☀️ 3 Fitur Utama untuk Demo Penilaian

Berikut adalah 3 fitur utama yang diimplementasikan dan siap didemokan ke dosen penguji:

### 1. Fitur 1: Pencarian Kota & Visualisasi Dashboard Cuaca (UI/UX)
* **Deskripsi:** Halaman utama interaktif yang menampilkan kolom form pencarian kota dinamis dan menyajikan kartu informasi komponen cuaca terstruktur (suhu, kelembaban, kecepatan angin) pasca kota dipilih.
* **Teknis:** Data cuaca dioper ke state lokal lalu dirender ke screen menggunakan komponen visual yang bersih.
* **Tanggung Jawab Demo:** Anggota 1 (Atta rizal).

### 2. Fitur 2: Sinkronisasi Data Real-Time & Global Interceptors (Axios)
* **Deskripsi:** Jembatan komunikasi data asinkron (`async/await`) ke Open-Meteo API. Dilengkapi sistem pencatatan log otomatis setiap kali request terkirim maupun response data diterima, serta fitur pencegah crash jika jaringan drop.
* **Teknis:** Memanfaatkan Axios create instance dengan konfigurasi terpusat dan penanganan kode error terperinci.
* **Tanggung Jawab Demo:** Anggota 2 (Faiz Dwi).

### 3. Fitur 3: Firebase Authentication & Cloud Favorite Storage (Firebase)
* **Deskripsi:** Fitur pengamanan akun pengguna (Daftar & Masuk) serta menu halaman penyimpanan data khusus untuk menandai lokasi-lokasi kota cuaca favorit pengguna secara permanen di cloud database.
* **Teknis:** Menggunakan Firebase Auth SDK dan fungsi penulisan/penghapusan dokumen di Cloud Firestore.
* **Tanggung Jawab Demo:** Anggota 3 (Rehan Maulana).

---

## 🔌 Daftar API yang Digunakan

Aplikasi ini menggunakan layanan public API gratis dari **Open-Meteo API**:

1. **Mencari Daftar Kota:** `GET https://geocoding-api.open-meteo.com/v1/search?name={cityName}&count=5&language=id&format=json`
2. **Mengambil Cuaca Real-Time:** `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`

---

## 🛠️ Cara Menjalankan Aplikasi

1. **Clone Repositori:**
   ```bash
   git clone <link-repo-kelompok-anda>
   cd geoweather-mobile