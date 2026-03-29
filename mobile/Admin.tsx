import React from "react";
import { Button, View } from "react-native";

export default function Admin() {
  return (
    <View>
      <Button title="Kill Switch ON" onPress={() => void fetch("/api/admin/kill", { method: "POST" })} />
      <Button title="Retrain" onPress={() => void fetch("/api/admin/retrain", { method: "POST" })} />
    </View>
  );
}
