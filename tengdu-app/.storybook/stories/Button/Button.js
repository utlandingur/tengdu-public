import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { styled } from "tamagui";
import { Button } from "@tamagui/button";

const StyledButton = styled(Button, {
  color: "red"
});

export const MyButton = ({ onPress, text }) => {
  return <StyledButton onPress={onPress}>{text}</StyledButton>;
};
