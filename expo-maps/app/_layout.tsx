import { Stack, Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "black" }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="golf-course" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergencyButtonScreen"
        options={{
          headerShown: false,
          title: "Emergency",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="emergency-share" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
