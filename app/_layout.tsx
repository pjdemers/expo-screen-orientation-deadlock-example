
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="intro" options={{ title: 'Intro', headerShown: false }} />
      <Tabs.Screen name="index" options={{ title: 'Table', headerShown: false }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', headerShown: false }} />
    </Tabs>
  );
}
