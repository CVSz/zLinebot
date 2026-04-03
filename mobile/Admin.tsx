import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { toggleExperiment, triggerRetrain } from "./api";

type IncidentSeverity = "low" | "medium" | "high";
type AdminScreen = "overview" | "guardrails" | "incidents" | "automation" | "broadcast";

type Experiment = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

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
    maxQueueDepth: number;
  };
  incidents: Array<{ id: string; title: string; severity: IncidentSeverity; acknowledged: boolean; createdAt: string }>;
  experiments: Experiment[];
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
    maxConcurrentCampaigns: 8,
    maxQueueDepth: 1200
  },
  incidents: [
    {
      id: "inc-001",
      title: "Spike in declined cards",
      severity: "medium",
      acknowledged: false,
      createdAt: "2026-04-03T08:40:00Z"
    },
    {
      id: "inc-002",
      title: "TikTok token nearing expiry",
      severity: "low",
      acknowledged: false,
      createdAt: "2026-04-03T09:10:00Z"
    },
    {
      id: "inc-003",
      title: "Warehouse sync lag > 90s",
      severity: "high",
      acknowledged: false,
      createdAt: "2026-04-03T09:40:00Z"
    }
  ],
  experiments: [
    {
      id: "exp-reco-mix-v3",
      name: "Recommendation Mixer V3",
      description: "Blend causal ranker with seasonal affinity",
      enabled: true
    },
    {
      id: "exp-fraud-adapt-threshold",
      name: "Adaptive Fraud Threshold",
      description: "Dynamically adjust risk threshold by time-of-day",
      enabled: false
    },
    {
      id: "exp-convo-checkout",
      name: "Conversational Checkout",
      description: "One-shot cart-to-payment flow in chat",
      enabled: true
    }
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
  const [activeScreen, setActiveScreen] = useState<AdminScreen>("overview");
  const [announcement, setAnnouncement] = useState("");
  const [status, setStatus] = useState("Control Center Online");
  const [isBusy, setIsBusy] = useState(false);

  const openIncidents = useMemo(() => state.incidents.filter((incident) => !incident.acknowledged).length, [state]);

  const criticalAlerts = useMemo(
    () => state.incidents.filter((incident) => !incident.acknowledged && incident.severity === "high").length,
    [state]
  );

  const applyGuardrailPreset = (mode: "safe" | "aggressive") => {
    if (mode === "safe") {
      setState((prev) => ({
        ...prev,
        moderation: {
          ...prev.moderation,
          autoBanRiskScore: 0.9,
          requireManualRefundReview: true,
          blockSuspiciousIps: true
        },
        operations: {
          ...prev.operations,
          fraudThreshold: 0.78,
          maxQueueDepth: 1000
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
      },
      operations: {
        ...prev.operations,
        fraudThreshold: 0.62,
        maxQueueDepth: 1500
      }
    }));
    setStatus("Aggressive preset applied");
  };

  const acknowledgeIncident = (incidentId: string) => {
    setState((prev) => ({
      ...prev,
      incidents: prev.incidents.map((item) =>
        item.id === incidentId ? { ...item, acknowledged: !item.acknowledged } : item
      )
    }));
  };

  const toggleExperimentLocal = async (id: string) => {
    setIsBusy(true);
    try {
      await toggleExperiment(id);
      setState((prev) => ({
        ...prev,
        experiments: prev.experiments.map((experiment) =>
          experiment.id === id ? { ...experiment, enabled: !experiment.enabled } : experiment
        )
      }));
      setStatus(`Experiment toggled: ${id}`);
    } catch {
      setStatus(`Failed to toggle experiment: ${id}`);
    } finally {
      setIsBusy(false);
    }
  };

  const runRetrain = async () => {
    setIsBusy(true);
    try {
      await triggerRetrain();
      setStatus("Retrain job queued");
    } catch {
      setStatus("Retrain job failed to queue");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Admin Control Panel</Text>
      <Text style={{ marginBottom: 14 }}>
        Open incidents: {openIncidents} · Critical: {criticalAlerts}
      </Text>
      <Text style={{ marginBottom: 12, color: "#666" }}>Status: {status}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TabButton
          label="Overview"
          active={activeScreen === "overview"}
          onPress={() => setActiveScreen("overview")}
        />
        <TabButton
          label="Guardrails"
          active={activeScreen === "guardrails"}
          onPress={() => setActiveScreen("guardrails")}
        />
        <TabButton
          label="Incidents"
          active={activeScreen === "incidents"}
          onPress={() => setActiveScreen("incidents")}
        />
        <TabButton
          label="Automation"
          active={activeScreen === "automation"}
          onPress={() => setActiveScreen("automation")}
        />
        <TabButton
          label="Broadcast"
          active={activeScreen === "broadcast"}
          onPress={() => setActiveScreen("broadcast")}
        />
      </View>

      {activeScreen === "overview" && (
        <>
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
              onValueChange={(budgetPaused) =>
                setState((prev) => ({ ...prev, system: { ...prev.system, budgetPaused } }))
              }
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
              onValueChange={(aiAutopilot) =>
                setState((prev) => ({ ...prev, system: { ...prev.system, aiAutopilot } }))
              }
            />
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Ops Budgeting</Text>
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
            <Stepper
              label="Max queue depth"
              value={state.operations.maxQueueDepth}
              onChange={(maxQueueDepth) =>
                setState((prev) => ({ ...prev, operations: { ...prev.operations, maxQueueDepth } }))
              }
              step={100}
            />
          </View>
        </>
      )}

      {activeScreen === "guardrails" && (
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
      )}

      {activeScreen === "incidents" && (
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Incident Queue</Text>
          {state.incidents.map((incident) => (
            <View key={incident.id} style={{ marginBottom: 8 }}>
              <Text>
                {incident.title} ({incident.severity})
              </Text>
              <Text style={{ color: "#666", marginBottom: 6 }}>{incident.createdAt}</Text>
              <Pressable
                onPress={() => acknowledgeIncident(incident.id)}
                style={{
                  backgroundColor: incident.acknowledged ? "#4d7c0f" : "#1d4ed8",
                  padding: 8,
                  borderRadius: 8,
                  marginTop: 4
                }}
              >
                <Text style={{ color: "white" }}>{incident.acknowledged ? "Acknowledged" : "Acknowledge"}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {activeScreen === "automation" && (
        <>
          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Model Ops</Text>
            <Pressable
              onPress={runRetrain}
              disabled={isBusy}
              style={{ backgroundColor: isBusy ? "#9ca3af" : "#111", padding: 10, borderRadius: 8 }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>{isBusy ? "Working..." : "Trigger Retrain"}</Text>
            </Pressable>
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Experiments</Text>
            {state.experiments.map((experiment) => (
              <View key={experiment.id} style={{ borderWidth: 1, borderColor: "#efefef", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <Text style={{ fontWeight: "600" }}>{experiment.name}</Text>
                <Text style={{ color: "#555" }}>{experiment.description}</Text>
                <Text style={{ marginVertical: 4 }}>Status: {experiment.enabled ? "Enabled" : "Disabled"}</Text>
                <Pressable
                  onPress={() => toggleExperimentLocal(experiment.id)}
                  disabled={isBusy}
                  style={{
                    backgroundColor: isBusy ? "#9ca3af" : experiment.enabled ? "#b91c1c" : "#15803d",
                    padding: 8,
                    borderRadius: 8
                  }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    {experiment.enabled ? "Disable" : "Enable"} Experiment
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {activeScreen === "broadcast" && (
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
