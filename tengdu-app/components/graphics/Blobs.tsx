import { Image } from "react-native";
import { XStack } from "@tamagui/stacks";

export default function Blobs() {
  return (
    <XStack
      height={220}
      justifyContent="center"
    >
      <Image
        source={require("../../assets/groupblobs.png")}
        style={{ maxWidth: 370, height: 250 }}
      />
    </XStack>
  );
}
