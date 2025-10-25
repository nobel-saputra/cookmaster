import { StyleSheet, Text, View } from "react-native";

export default function RegisterPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
