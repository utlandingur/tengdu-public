import { Keyboard, TouchableWithoutFeedback, View } from "react-native";

interface DismissKeyboardProps {
  children: React.ReactNode;
}

export const DismissKeyboard = ({ children }: DismissKeyboardProps) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={{ flex: 1 }}>{children}</View>
  </TouchableWithoutFeedback>
);
