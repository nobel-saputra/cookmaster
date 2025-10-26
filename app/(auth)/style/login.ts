import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 50,
    fontWeight: "600"
  },
  h2: {
    fontSize: 17,
    textAlign: "left",
    marginBottom: 15,
    fontWeight: "400",
  },
  input: {
    borderWidth: 2,
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderColor: "#000",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  linkText: {
    textAlign: "center",
    marginTop: 10,
    color: "#000",
  },
});
