import React from "react";
import { Button, ButtonProps } from "@tamagui/button";
import CentredSpinner from "components/CentredSpinner";
import { TamaguiElement, Text } from "tamagui";

import { onPressStyles } from "../../tamagui.config";

interface MyButtonProps extends ButtonProps {
  type?: "primary" | "secondary" | "tertiary" | "danger";
  noBorder?: boolean;
  rounded?: boolean;
  onPress?: () => void | Promise<void>;
  text?: string;
  submittingState?: boolean; // for use with forms
}

const MyButton = React.forwardRef<TamaguiElement, MyButtonProps>(
  (
    { type, rounded, noBorder, onPress, text, submittingState, ...props },
    ref
  ) => {
    const [loading, setLoading] = React.useState(false);

    // set spinner whilst awaiting async function
    const handleOnPress = async () => {
      if (!onPress) return;

      setLoading(true);
      try {
        await onPress();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // To avoid going through every button already implemented with children
    const textToDisplay = text || props.children;

    return (
      <Button
        ref={ref}
        testID={props.testID || "my-button"}
        backgroundColor={`$${type}Background`}
        color={`$${type}Color`}
        borderRadius={rounded ? 32 : undefined}
        borderColor={noBorder ? "#fff" : `$${type}Color`}
        hoverStyle={{
          backgroundColor: `$${type}Background`,
          opacity: 0.7
        }}
        pressStyle={{
          backgroundColor: `$${type}Background`,
          borderColor: noBorder ? "#fff" : `$${type}Color`,
          opacity: onPressStyles.opacity,
          transform: onPressStyles.transform
        }}
        fontWeight={"900"}
        {...props}
        onPress={handleOnPress}
      >
        {submittingState || loading ? (
          <>
            <CentredSpinner
              color={`$${type}Color`}
              size="small"
            />
            <Text opacity={0}>{textToDisplay}</Text>
          </>
        ) : (
          textToDisplay
        )}
      </Button>
    );
  }
);

MyButton.displayName = "MyButton";

export default MyButton;
