import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

type Metrics = {
  revenue?: number;
  orders?: number;
  users?: number;
};

export default function App() {
  const [metrics, setMetrics] = useState<Metrics>({});

  useEffect(() => {
    const ws = new WebSocket("ws://your-server/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as {
        type?: string;
        data?: Metrics;
      };

      if (data.type === "metrics") {
        setMetrics(data.data ?? {});
      }
    };

    return () => ws.close();
  }, []);

  return (
    <View>
      <Text>Revenue: {metrics.revenue ?? 0}</Text>
      <Text>Orders: {metrics.orders ?? 0}</Text>
      <Text>Users: {metrics.users ?? 0}</Text>
    </View>
  );
}
