import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

type PreferenceKey = "notifications" | "darkMode" | "autoApplyCoupons" | "shareAnalytics";
type Preferences = Record<PreferenceKey, boolean>;

type SubscriptionTier = "Free" | "Pro" | "Enterprise";

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

export default function App() {
  const [state, setState] = useState<UserControlState>(initialState);
  const [status, setStatus] = useState("Ready");

  const completion = useMemo(() => {
    const profileComplete = Object.values(state.profile).every((value) => value.trim().length > 0);
    const securityComplete = state.security.twoFactorEnabled && state.security.loginAlerts;
    const score = [profileComplete, securityComplete, state.preferences.notifications].filter(Boolean).length;
    return Math.round((score / 3) * 100);
  }, [state]);

  const setPreference = (key: PreferenceKey, value: boolean) => {
    setState((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
  };

  const saveProfile = () => {
    setStatus(`Profile saved at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>all feature master meta full final release complete</Text>
      <Text style={{ marginBottom: 14 }}>Account completeness: {completion}%</Text>

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
          onValueChange={(loginAlerts) => setState((prev) => ({ ...prev, security: { ...prev.security, loginAlerts } }))}
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

      <Text style={{ marginBottom: 24, color: "#666" }}>Status: {status}</Text>
    </ScrollView>
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
