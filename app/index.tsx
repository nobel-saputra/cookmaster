/**
 * Index Page
 *
 * Halaman root yang menampilkan home placeholder.
 * Dalam routing, user yang sudah login akan di-redirect ke /(tabs) oleh _layout.tsx
 */

import { Text, View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home CookMaster</Text>
    </View>
  );
}
