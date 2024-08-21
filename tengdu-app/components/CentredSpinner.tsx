import { Spinner } from "tamagui";

interface MySpinnerProps {
  size?: "small" | "large";
  color?: string;
  flex?: number;
}

const MySpinner = ({ size, color, flex }: MySpinnerProps) => (
  <Spinner
    flex={flex}
    size={size ?? "small"}
    color={color ?? "grey"}
    testID="spinner"
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center"
    }}
  />
);

export default MySpinner;
