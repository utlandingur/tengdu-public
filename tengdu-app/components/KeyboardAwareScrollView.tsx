import { useState } from "react";
import { Dimensions, ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView as OriginalKeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { TAB_BAR_HEIGHT } from "../GLOBAL_VALUES";

interface CustomKeyboardAwareScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: ScrollViewProps;
  navBarOnScreen?: boolean; // ensures the extraScrollHeight is calculated correctly
}

// Custom KeyboardAwareScrollView component to handle the extraScrollHeight

const KeyboardAwareScrollView = ({
  children,
  contentContainerStyle,
  navBarOnScreen,
  ...props
}: CustomKeyboardAwareScrollViewProps) => {
  const { height: DEVICE_HEIGHT } = Dimensions.get("screen");
  const [componentPosition, setComponentPosition] = useState<any>(null);

  let navBarHeight = 0;
  if (navBarOnScreen) {
    navBarHeight = TAB_BAR_HEIGHT - 10; // small buffer so it doesn't touch the bottom
  }

  // If not set, extraScrollHeight is calculated based on the component position
  const extraScrollHeight = componentPosition
    ? DEVICE_HEIGHT -
      componentPosition.y -
      componentPosition.height -
      navBarHeight
    : 0;

  return (
    <OriginalKeyboardAwareScrollView
      {...props}
      contentContainerStyle={contentContainerStyle || { height: "100%" }} // ensures it fills up all the space
      extraScrollHeight={extraScrollHeight}
      onLayout={(event) => setComponentPosition(event.nativeEvent.layout)}
    >
      {children}
    </OriginalKeyboardAwareScrollView>
  );
};

export default KeyboardAwareScrollView;
