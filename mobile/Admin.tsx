import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

type IncidentSeverity = "low" | "medium" | "high";

type AdminState = {
  system: {
    killSwitch: boolean;
    budgetPaused: boolean;
    maintenanceMode: boolean;
    aiAutopilot: boolean;
  };
  moderation: {
    autoBanRiskScore: number;
    requireManualRefundReview: boolean;
    blockSuspiciousIps: boolean;
  };
  operations: {
    dailyBudgetLimit: number;
    fraudThreshold: number;
    maxConcurrentCampaigns: number;
  };
  incidents: Array<{ id: string; title: string; severity: IncidentSeverity; acknowledged: boolean }>;
};

const initialState: AdminState = {
  system: {
    killSwitch: false,
    budgetPaused: false,
    maintenanceMode: false,
    aiAutopilot: true
  },
  moderation: {
    autoBanRiskScore: 0.85,
    requireManualRefundReview: true,
    blockSuspiciousIps: true
  },
  operations: {
    dailyBudgetLimit: 2500,
    fraudThreshold: 0.7,
    maxConcurrentCampaigns: 8
  },
  incidents: [
    { id: "inc-001", title: "Spike in declined cards", severity: "medium", acknowledged: false },
    { id: "inc-002", title: "TikTok token nearing expiry", severity: "low", acknowledged: false }
  ]
};

const cardStyle = {
  borderWidth: 1,
  borderColor: "#d9d9d9",
  borderRadius: 10,
  padding: 14,
  marginBottom: 12
} as const;

export default function Admin() {
  const [state, setState] = useState<AdminState>(initialState);
  const [announcement, setAnnouncement] = useState("");
  const [status, setStatus] = useState("Control center online");

  const openIncidents = useMemo(() => state.incidents.filter((incident) => !incident.acknowledged).length, [state]);

  const applyGuardrailPreset = (mode: "safe" | "aggressive") => {
    if (mode === "safe") {
      setState((prev) => ({
        ...prev,
        moderation: {
          ...prev.moderation,
          autoBanRiskScore: 0.9,
          requireManualRefundReview: true,
          blockSuspiciousIps: true
        }
      }));
      setStatus("Safe preset applied");
      return;
    }

    setState((prev) => ({
      ...prev,
      moderation: {
        ...prev.moderation,
        autoBanRiskScore: 0.65,
        requireManualRefundReview: false,
        blockSuspiciousIps: true
      }
    }));
    setStatus("Aggressive preset applied");
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Admin Control Panel</Text>
      <Text style={{ marginBottom: 14 }}>Open incidents: {openIncidents}</Text>

      <View style={cardStyle}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>System Controls</Text>
        <PanelToggle
          label="Kill switch"
          value={state.system.killSwitch}
          onValueChange={(killSwitch) => setState((prev) => ({ ...prev, system: { ...prev.system, killSwitch } }))}
        />
        <PanelToggle
          label="Budget pause"
          value={state.system.budgetPaused}
          onValueChange={(budgetPaused) => setState((prev) => ({ ...prev, system: { ...prev.system, budgetPaused } }))}
        />
        <PanelToggle
          label="Maintenance mode"
          value={state.system.maintenanceMode}
          onValueChange={(maintenanceMode) =>
            setState((prev) => ({ ...prev, system: { ...prev.system, maintenanceMode } }))
          }
        />
        <PanelToggle
          label="AI autopilot"
          value={state.system.aiAutopilot}
          onValueChange={(aiAutopilot) => setState((prev) => ({ ...prev, system: { ...prev.system, aiAutopilot } }))}
        />
      </View>

      <View style={cardStyle}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Risk & Moderation</Text>
        <Text>Auto-ban risk score: {state.moderation.autoBanRiskScore.toFixed(2)}</Text>
        <Text>Fraud threshold: {state.operations.fraudThreshold.toFixed(2)}</Text>
        <PanelToggle
          label="Manual refund review"
          value={state.moderation.requireManualRefundReview}
          onValueChange={(requireManualRefundReview) =>
            setState((prev) => ({
              ...prev,
              moderation: { ...prev.moderation, requireManualRefundReview }
            }))
          }
        />
        <PanelToggle
          label="Block suspicious IPs"
          value={state.moderation.blockSuspiciousIps}
          onValueChange={(blockSuspiciousIps) =>
            setState((prev) => ({ ...prev, moderation: { ...prev.moderation, blockSuspiciousIps } }))
          }
        />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={() => applyGuardrailPreset("safe")}
            style={{ padding: 10, borderRadius: 8, backgroundColor: "#111" }}
          >
            <Text style={{ color: "white" }}>Apply Safe Preset</Text>
          </Pressable>
          <Pressable
            onPress={() => applyGuardrailPreset("aggressive")}
            style={{ padding: 10, borderRadius: 8, backgroundColor: "#b45309" }}
          >
            <Text style={{ color: "white" }}>Apply Aggressive Preset</Text>
          </Pressable>
        </View>
      </View>

      <View style={cardStyle}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Operations Budgeting</Text>
        <Stepper
          label="Daily budget limit"
          value={state.operations.dailyBudgetLimit}
          onChange={(dailyBudgetLimit) =>
            setState((prev) => ({ ...prev, operations: { ...prev.operations, dailyBudgetLimit } }))
          }
          step={100}
        />
        <Stepper
          label="Max concurrent campaigns"
          value={state.operations.maxConcurrentCampaigns}
          onChange={(maxConcurrentCampaigns) =>
            setState((prev) => ({ ...prev, operations: { ...prev.operations, maxConcurrentCampaigns } }))
          }
          step={1}
        />
      </View>

      <View style={cardStyle}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Incident Queue</Text>
        {state.incidents.map((incident) => (
          <View key={incident.id} style={{ marginBottom: 8 }}>
            <Text>
              {incident.title} ({incident.severity})
            </Text>
            <Pressable
              onPress={() => {
                setState((prev) => ({
                  ...prev,
                  incidents: prev.incidents.map((item) =>
                    item.id === incident.id ? { ...item, acknowledged: true } : item
                  )
                }));
              }}
              style={{ backgroundColor: incident.acknowledged ? "#4d7c0f" : "#1d4ed8", padding: 8, borderRadius: 8, marginTop: 4 }}
            >
              <Text style={{ color: "white" }}>{incident.acknowledged ? "Acknowledged" : "Acknowledge"}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={cardStyle}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Broadcast Message</Text>
        <TextInput
          value={announcement}
          onChangeText={setAnnouncement}
          placeholder="Send message to all operators"
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 8 }}
        />
        <Pressable
          onPress={() => setStatus(`Announcement queued (${announcement.length} chars)`)}
          style={{ backgroundColor: "#111", padding: 10, borderRadius: 8 }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Send Broadcast</Text>
        </Pressable>
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

type StepperProps = {
  label: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
};

function Stepper({ label, value, step, onChange }: StepperProps) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ marginBottom: 6 }}>
        {label}: {value}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={() => onChange(Math.max(0, value - step))}
          style={{ backgroundColor: "#efefef", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
        >
          <Text>-</Text>
        </Pressable>
        <Pressable
          onPress={() => onChange(value + step)}
          style={{ backgroundColor: "#efefef", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
        >
          <Text>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
