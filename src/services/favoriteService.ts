import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";
import {
    CityResult,
    WeatherResponse,
} from "./weatherApi";

export type FavoriteCity = {
  id: string;
  cityId: number;
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  weatherCode: number;
  createdAt?: unknown;
};
// menyimpan kota favorit
export const saveFavorite = async (
  userId: string,
  city: CityResult,
  weather: WeatherResponse
): Promise<void> => {
  if (!userId) {
    throw new Error("Pengguna Belum Login.");
  }

  const favoriteId = String(city.id);

  const favoriteRef = doc(
    db,
    "users",
    userId,
    "favorites",
    favoriteId
  );

  await setDoc(favoriteRef, {
    cityId: city.id,
    name: city.name,
    admin1: city.admin1 ?? "",
    country: city.country ?? "",
    latitude: city.latitude,
    longitude: city.longitude,
    temperature: weather.current.temperature_2m,
    weatherCode: weather.current.weather_code,
    createdAt: serverTimestamp(),
  });
};

// Membaca kota favorit
export const getFavorites = async (
  userId: string
): Promise<FavoriteCity[]> => {
  if (!userId) {
    throw new Error("Pengguna belum login.");
  }

  const favoritesRef = collection(
    db,
    "users",
    userId,
    "favorites"
  );

  const snapshot = await getDocs(favoritesRef);

  return snapshot.docs.map((favoriteDocument) => ({
    id: favoriteDocument.id,
    ...favoriteDocument.data(),
  })) as FavoriteCity[];
};
// Menghapus kota favorit
export const removeFavorite = async (
  userId: string,
  favoriteId: string
): Promise<void> => {
  if (!userId) {
    throw new Error("Pengguna belum login.");
  }

  const favoriteRef = doc(
    db,
    "users",
    userId,
    "favorites",
    favoriteId
  );

  await deleteDoc(favoriteRef);
};