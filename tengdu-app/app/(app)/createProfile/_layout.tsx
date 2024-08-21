import { Stack } from "expo-router";
import { DismissKeyboard } from "utils/inputUtils";

import { MyStack } from "../../../components/MyStack";

export default function Layout() {
  return (
    <DismissKeyboard>
      <MyStack>
        <Stack
          screenOptions={{
            headerShown: false
          }}
        />
      </MyStack>
    </DismissKeyboard>
  );
}
