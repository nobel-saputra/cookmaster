import { StyleSheet } from "react-native"

export const cartStyle = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorText: { fontSize: 18, color: "red" },
  emptyText: { fontSize: 18, color: "#999", marginTop: 10, marginBottom: 20 },
  scrollContent: { padding: 15 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemPrice: { fontSize: 14, color: "#888", marginTop: 4 },
  removeButton: { padding: 6 },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 15,
    backgroundColor: "#fff",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalLabel: { fontSize: 18, fontWeight: "600" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#FF7A00" },

  checkoutButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  exploreButton: {
    backgroundColor: "#00B894",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
