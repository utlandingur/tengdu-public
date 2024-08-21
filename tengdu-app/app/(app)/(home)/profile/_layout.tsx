import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="editAvailability"
        options={{
          headerTitle: "Edit Availability",
          headerBackTitle: "Save"
        }}
      />
      <Stack.Screen
        name="editInterests"
        options={{
          headerTitle: "Edit Interests",
          headerBackTitle: "Save"
        }}
      />
      <Stack.Screen
        name="editLocation"
        options={{
          headerTitle: "Edit Location",
          headerBackTitle: "Save"
        }}
      />
      <Stack.Screen
        name="editPreferences"
        options={{
          headerTitle: "Edit Matching Preferences",
          headerBackTitle: "Save"
        }}
      />
    </Stack>
  );
}
