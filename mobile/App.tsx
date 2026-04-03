import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { localAI } from "./ai";

type ScreenKey = "shop" | "orders" | "assistant" | "settings";
type SubscriptionTier = "Free" | "Pro" | "Enterprise";
type OrderStatus = "created" | "confirmed" | "packed" | "shipped" | "delivered";

type Product = {
  id: string;
  name: string;
  category: "Beauty" | "Gadgets" | "Home" | "Fashion";
  price: number;
  stock: number;
  rating: number;
};

type CartItem = {
  productId: string;
  quantity: number;
};

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
};

type PreferenceKey = "notifications" | "darkMode" | "autoApplyCoupons" | "shareAnalytics";
type Preferences = Record<PreferenceKey, boolean>;

type UserControlState = {
  profile: {
    displayName: string;
    email: string;
    phone: string;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
  };
  loyalty: {
    points: number;
    tier: SubscriptionTier;
  };
  preferences: Preferences;
};

const initialProducts: Product[] = [
  { id: "p-001", name: "Nano Serum", category: "Beauty", price: 29, stock: 12, rating: 4.6 },
  { id: "p-002", name: "Smart Blender", category: "Home", price: 89, stock: 7, rating: 4.4 },
  { id: "p-003", name: "Airbuds Lite", category: "Gadgets", price: 59, stock: 18, rating: 4.3 },
  { id: "p-004", name: "Cloud Hoodie", category: "Fashion", price: 49, stock: 10, rating: 4.7 },
  { id: "p-005", name: "Desk Aroma", category: "Home", price: 25, stock: 20, rating: 4.2 }
];

const initialState: UserControlState = {
  profile: {
    displayName: "Demo User",
    email: "demo@zlinebot.local",
    phone: "+1 555-0100"
  },
  security: {
    twoFactorEnabled: false,
    loginAlerts: true
  },
  loyalty: {
    points: 1450,
    tier: "Pro"
  },
  preferences: {
    notifications: true,
    darkMode: false,
    autoApplyCoupons: true,
    shareAnalytics: false
  }
};

const cardStyle = {
  borderWidth: 1,
  borderColor: "#d9d9d9",
  borderRadius: 10,
  padding: 14,
  marginBottom: 12
} as const;

const tierDiscount: Record<SubscriptionTier, number> = {
  Free: 0,
  Pro: 0.05,
  Enterprise: 0.1
};

const orderFlow: OrderStatus[] = ["created", "confirmed", "packed", "shipped", "delivered"];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("shop");
  const [state, setState] = useState<UserControlState>(initialState);
  const [products] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assistantInput, setAssistantInput] = useState("Recommend me a bundle for home office");
  const [assistantReply, setAssistantReply] = useState("AI copilot is ready.");
  const [status, setStatus] = useState("Mobile super app ready");

  const completion = useMemo(() => {
    const profileComplete = Object.values(state.profile).every((value) => value.trim().length > 0);
    const securityComplete = state.security.twoFactorEnabled && state.security.loginAlerts;
    const score = [profileComplete, securityComplete, state.preferences.notifications].filter(Boolean).length;
    return Math.round((score / 3) * 100);
  }, [state]);

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) || product.category.toLowerCase().includes(normalized)
    );
  }, [products, search]);

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return sum;
      }
      return sum + product.price * item.quantity;
    }, 0);

    const discount = subtotal * tierDiscount[state.loyalty.tier];
    const autoCouponDiscount = state.preferences.autoApplyCoupons && subtotal >= 120 ? 10 : 0;
    const total = Math.max(0, subtotal - discount - autoCouponDiscount);

    return {
      subtotal,
      discount,
      autoCouponDiscount,
      total,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart, products, state.loyalty.tier, state.preferences.autoApplyCoupons]);

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    setStatus("Added item to cart");
  };

  const checkout = () => {
    if (cartTotals.itemCount === 0) {
      setStatus("Cart is empty");
      return;
    }

    const nextOrder: Order = {
      id: `ord-${String(orders.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      status: "created",
      itemCount: cartTotals.itemCount,
      total: Number(cartTotals.total.toFixed(2))
    };

    setOrders((prev) => [nextOrder, ...prev]);
    setState((prev) => ({
      ...prev,
      loyalty: { ...prev.loyalty, points: prev.loyalty.points + Math.round(cartTotals.total) }
    }));
    setCart([]);
    setStatus(`Checkout complete: ${nextOrder.id}`);
    setActiveScreen("orders");
  };

  const advanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) {
          return order;
        }
        const currentIndex = orderFlow.indexOf(order.status);
        if (currentIndex === orderFlow.length - 1) {
          return order;
        }
        return { ...order, status: orderFlow[currentIndex + 1] };
      })
    );
  };

  const setPreference = (key: PreferenceKey, value: boolean) => {
    setState((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
  };

  const saveProfile = () => {
    setStatus(`Profile saved at ${new Date().toLocaleTimeString()}`);
  };

  const runAssistant = () => {
    const transformed = localAI(assistantInput);
    setAssistantReply(`Intent fingerprint: ${transformed.slice(0, 80)}${transformed.length > 80 ? "..." : ""}`);
    setStatus("AI assistant generated recommendation draft");
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>zLinebot Mobile</Text>
      <Text style={{ marginBottom: 12 }}>Status: {status}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TabButton label="Shop" active={activeScreen === "shop"} onPress={() => setActiveScreen("shop")} />
        <TabButton label="Orders" active={activeScreen === "orders"} onPress={() => setActiveScreen("orders")} />
        <TabButton
          label="Assistant"
          active={activeScreen === "assistant"}
          onPress={() => setActiveScreen("assistant")}
        />
        <TabButton
          label="Settings"
          active={activeScreen === "settings"}
          onPress={() => setActiveScreen("settings")}
        />
      </View>

      {activeScreen === "shop" && (
        <>
          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Smart Catalog</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search product or category"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, marginBottom: 8 }}
            />
            {filteredProducts.map((product) => (
              <View
                key={product.id}
                style={{ borderWidth: 1, borderColor: "#efefef", borderRadius: 8, padding: 10, marginBottom: 8 }}
              >
                <Text style={{ fontWeight: "600" }}>{product.name}</Text>
                <Text>
                  {product.category} · ${product.price} · ⭐ {product.rating}
                </Text>
                <Text style={{ marginBottom: 6 }}>Stock: {product.stock}</Text>
                <Pressable
                  onPress={() => addToCart(product.id)}
                  style={{ backgroundColor: "#111", padding: 8, borderRadius: 8 }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>Add to cart</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Cart Summary</Text>
            <Text>Items: {cartTotals.itemCount}</Text>
            <Text>Subtotal: ${cartTotals.subtotal.toFixed(2)}</Text>
            <Text>Loyalty discount: -${cartTotals.discount.toFixed(2)}</Text>
            <Text>Auto coupon: -${cartTotals.autoCouponDiscount.toFixed(2)}</Text>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Total: ${cartTotals.total.toFixed(2)}</Text>
            <Pressable onPress={checkout} style={{ backgroundColor: "#1d4ed8", padding: 10, borderRadius: 8 }}>
              <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Checkout</Text>
            </Pressable>
          </View>
        </>
      )}

      {activeScreen === "orders" && (
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Order Timeline</Text>
          {orders.length === 0 && <Text>No orders yet. Checkout from the Shop tab.</Text>}
          {orders.map((order) => (
            <View
              key={order.id}
              style={{ borderWidth: 1, borderColor: "#efefef", borderRadius: 8, padding: 10, marginBottom: 8 }}
            >
              <Text style={{ fontWeight: "600" }}>{order.id}</Text>
              <Text>
                {order.itemCount} items · ${order.total.toFixed(2)}
              </Text>
              <Text style={{ marginBottom: 6 }}>Status: {order.status}</Text>
              <Pressable
                onPress={() => advanceOrder(order.id)}
                style={{ backgroundColor: "#0f766e", padding: 8, borderRadius: 8 }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>Advance Status</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {activeScreen === "assistant" && (
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>AI Commerce Assistant</Text>
          <TextInput
            value={assistantInput}
            onChangeText={setAssistantInput}
            placeholder="Describe what you want to buy"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 8 }}
          />
          <Pressable onPress={runAssistant} style={{ backgroundColor: "#7c3aed", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", textAlign: "center" }}>Generate Suggestion</Text>
          </Pressable>
          <Text style={{ marginTop: 8 }}>{assistantReply}</Text>
        </View>
      )}

      {activeScreen === "settings" && (
        <>
          <Text style={{ marginBottom: 10 }}>Account completeness: {completion}%</Text>

          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>Profile</Text>
            <TextInput
              value={state.profile.displayName}
              onChangeText={(displayName) =>
                setState((prev) => ({ ...prev, profile: { ...prev.profile, displayName } }))
              }
              placeholder="Display name"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, marginBottom: 8 }}
            />
            <TextInput
              value={state.profile.email}
              onChangeText={(email) => setState((prev) => ({ ...prev, profile: { ...prev.profile, email } }))}
              placeholder="Email"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, marginBottom: 8 }}
            />
            <TextInput
              value={state.profile.phone}
              onChangeText={(phone) => setState((prev) => ({ ...prev, profile: { ...prev.profile, phone } }))}
              placeholder="Phone"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, marginBottom: 10 }}
            />
            <Pressable onPress={saveProfile} style={{ backgroundColor: "#111", padding: 10, borderRadius: 8 }}>
              <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Save Profile</Text>
            </Pressable>
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Security</Text>
            <PanelToggle
              label="Two-factor authentication"
              value={state.security.twoFactorEnabled}
              onValueChange={(twoFactorEnabled) =>
                setState((prev) => ({ ...prev, security: { ...prev.security, twoFactorEnabled } }))
              }
            />
            <PanelToggle
              label="Login alerts"
              value={state.security.loginAlerts}
              onValueChange={(loginAlerts) =>
                setState((prev) => ({ ...prev, security: { ...prev.security, loginAlerts } }))
              }
            />
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Preferences</Text>
            <PanelToggle
              label="Push notifications"
              value={state.preferences.notifications}
              onValueChange={(value) => setPreference("notifications", value)}
            />
            <PanelToggle
              label="Dark mode"
              value={state.preferences.darkMode}
              onValueChange={(value) => setPreference("darkMode", value)}
            />
            <PanelToggle
              label="Auto apply coupons"
              value={state.preferences.autoApplyCoupons}
              onValueChange={(value) => setPreference("autoApplyCoupons", value)}
            />
            <PanelToggle
              label="Share analytics"
              value={state.preferences.shareAnalytics}
              onValueChange={(value) => setPreference("shareAnalytics", value)}
            />
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Loyalty & Subscription</Text>
            <Text>Tier: {state.loyalty.tier}</Text>
            <Text style={{ marginBottom: 8 }}>Points: {state.loyalty.points}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["Free", "Pro", "Enterprise"] as SubscriptionTier[]).map((tier) => (
                <Pressable
                  key={tier}
                  onPress={() => setState((prev) => ({ ...prev, loyalty: { ...prev.loyalty, tier } }))}
                  style={{
                    backgroundColor: state.loyalty.tier === tier ? "#2d6cdf" : "#efefef",
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 10
                  }}
                >
                  <Text style={{ color: state.loyalty.tier === tier ? "white" : "#222" }}>{tier}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function TabButton({ label, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? "#111" : "#efefef",
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12
      }}
    >
      <Text style={{ color: active ? "white" : "#222", fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

type PanelToggleProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function PanelToggle({ label, value, onValueChange }: PanelToggleProps) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
