import React from "react";
import { Button, View } from "react-native";

export default function Admin() {
  return (
    <View>
      <Button title="Kill Switch" onPress={() => void fetch("/api/admin/kill", { method: "POST" })} />
      <Button title="Budget Pause" onPress={() => void fetch("/api/admin/budget/pause", { method: "POST" })} />
      <Button title="Retrain Now" onPress={() => void fetch("/api/admin/retrain", { method: "POST" })} />
    </View>
  );
}
