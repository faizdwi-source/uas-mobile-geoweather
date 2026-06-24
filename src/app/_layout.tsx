import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1565c0",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="register"
        options={{
          title: "Buat Akun",
        }}
      />

      <Stack.Screen
        name="home"
        options={{
          title: "GeoWeather",
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="favorites"
        options={{
          title: "KOTA FAVORTI",
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
///