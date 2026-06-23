import axios from "axios";

export type CityResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
};

export type CurrentWeather = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  time: string;
};

export type WeatherResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    precipitation: string;
    wind_speed_10m: string;
  };
};

// #konfigurasiAPI
const geocodingApi = axios.create({
  baseURL: "https://geocoding-api.open-meteo.com/v1",
  timeout: 10000,
});

const weatherApi = axios.create({
  baseURL: "https://api.open-meteo.com/v1",
  timeout: 10000,
});

// REQUEST INTERCEPTOR
geocodingApi.interceptors.request.use((config) => {
  console.log("Geocoding Request:", config.url);
  return config;
});

weatherApi.interceptors.request.use((config) => {
  console.log("Weather Request:", config.url);
  return config;
});

// RESPONSE INTERCEPTOR
weatherApi.interceptors.response.use((response) => {
  console.log("Weather Response:", response.data);
  return response;
});

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      return "Permintaan terlalu lama. Silahkan Periksa koneksi internet anda.";
    }

    if (!error.response) {
      return "Tidak dapat terhubung ke layanan cuaca.";
    }

    return `Layanan cuaca sedang mengalami kesalahan (${error.response.status}).`;
  }

  return "Terjadi kesalahan yang tidak diketahui sekarang.";
};

export const searchCity = async (
  cityName: string
): Promise<CityResult[]> => 

  // request pencarian kota
  {
  try {
    const response = await geocodingApi.get("/search", {
      params: {
        name: cityName.trim(),
        count: 5,
        language: "id",
        format: "json",
      },
    });

    return response.data.results ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getCurrentWeather = async (
  latitude: number,
  longitude: number
): Promise<WeatherResponse> => 
  
  // request data cuaca
  {
  try {
    const response = await weatherApi.get<WeatherResponse>(
      "/forecast",
      {
        params: {
          latitude,
          longitude,
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
          ].join(","),
          timezone: "auto",
          forecast_days: 1,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};