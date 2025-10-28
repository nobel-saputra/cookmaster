// app/(auth)/style/register.ts

import { StyleSheet } from "react-native";

export const registerStyle = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4E56C0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#4E56C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#F5F5F5",
  },
  inputError: {
    borderColor: "#FF4444",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
  infoBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#2E7D32",
    marginBottom: 2,
  },
  button: {
    backgroundColor: "#4E56C0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#4E56C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonPressed: {
    backgroundColor: "#3B40A0",
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 15,
    color: "#666",
  },
  loginLink: {
    fontSize: 15,
    color: "#4E56C0",
    fontWeight: "bold",
  },
});
