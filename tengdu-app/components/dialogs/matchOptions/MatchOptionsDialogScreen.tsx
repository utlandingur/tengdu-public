import MyButton from "components/inputs/MyButton";
import {
  DialogInfo,
  DialogScreen
} from "factoryFunctions/createNavigatorComponent";
import { YStack } from "tamagui";

interface MatchOptionsDialogProps {
  navigate: (screen: string) => () => void;
}

export const MatchOptionsDialogBody = ({
  navigate
}: MatchOptionsDialogProps) => {
  return (
    <YStack space="$true">
      <MyButton
        text="Unmatch"
        type="secondary"
        rounded
        onPress={navigate("unmatch")}
      />
      <MyButton
        text="Report User"
        type="secondary"
        rounded
        onPress={navigate("report")}
      />
    </YStack>
  );
};

const MatchOptionsDialogFooter = () => {
  return null;
};

const matchOptionsDialogInfo: DialogInfo = {
  title: "Options",
  titleHidden: true,
  description: "Options for your match.",
  descriptionHidden: true,
  snapPoints: undefined,
  snapPointsMode: "fit",
  noScrollableBody: true,
  footerInBody: false
};

const matchOptionsScreen: DialogScreen = {
  dialogInfo: matchOptionsDialogInfo,
  body: MatchOptionsDialogBody,
  footer: MatchOptionsDialogFooter
};

export default matchOptionsScreen;
