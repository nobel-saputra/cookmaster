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
    fontWeight: "600",
  },
  h2: {
    fontSize: 17,
    textAlign: "left",
    marginBottom: 15,
    fontWeight: "400",
  },
  input: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkTextContainer: {
    textAlign: "center",
    marginTop: 10,
  },
  linkText: {
    color: "#4E56C0",
    fontWeight: "bold",
  },
});
