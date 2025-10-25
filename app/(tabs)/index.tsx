import { StyleSheet, Text, View } from "react-native";

export default function index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Index Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
