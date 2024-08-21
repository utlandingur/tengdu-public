import { forwardRef } from "react";
import { TouchableOpacity } from "react-native";
import MyButton from "components/inputs/MyButton";

import { onPressStyles } from "../tamagui.config";

interface ThreeDotsMenuProps {
  onPress?: () => void;
  // ref?: React.RefObject<TouchableOpacity>;
}

const ThreeDotsMenu = forwardRef<HTMLButtonElement, ThreeDotsMenuProps>(
  ({ onPress }, ref) => {
    return (
      <MyButton
        ref={ref}
        onPress={onPress}
        fontSize={"$8"}
        fontWeight={"600"}
        backgroundColor={"white"}
        color={"black"}
        pressStyle={{
          backgroundColor: "transparent",
          borderColor: "transparent",
          opacity: onPressStyles.opacity,
          transform: onPressStyles.transform
        }}
        hoverTheme={false}
        pressTheme={false}
      >
        ...
      </MyButton>
    );
  }
);

ThreeDotsMenu.displayName = "ThreeDotsMenu";

export default ThreeDotsMenu;
