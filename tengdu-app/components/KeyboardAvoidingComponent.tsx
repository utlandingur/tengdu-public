import { Platform } from "react-native";
import { ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native";

import { MySafeAreaView } from "./MySafeAreaView";

interface KeyboardAvoidingComponentProps {
  children;
}

export default function KeyboardAvoidingComponent(
  props: KeyboardAvoidingComponentProps
) {
  return (
    <KeyboardAvoidingView
      // style={{ flex: 1, justifyContent: "flex-start" }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <ScrollView>{props.children}</ScrollView>
    </KeyboardAvoidingView>
  );
}
