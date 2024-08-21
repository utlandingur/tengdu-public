import MyButton from "components/inputs/MyButton";
import { useRouter } from "expo-router";
import {
  DialogInfo,
  DialogScreen
} from "factoryFunctions/createNavigatorComponent";

import { Dialog, XStack } from "tamagui";

import { removeUserFromMatch } from "../../../firebaseFunctions";
import { MatchInfo, PublicUserInfo } from "models/user";

interface UnmatchDialogBodyProps {
  matchInfo: { match: MatchInfo; users: PublicUserInfo[] };
  navigate: (screen: string) => () => void;
}

export const UnmatchDialogBody = ({
  navigate,
  matchInfo
}: UnmatchDialogBodyProps) => {
  const router = useRouter();
  const { match } = matchInfo;
  const handleUnmatch = async () => {
    await removeUserFromMatch(match.id);
    router.navigate("/chat");
  };
  return (
    <XStack
      justifyContent="space-between"
      paddingTop="$4"
      paddingBottom="$6"
    >
      <MyButton
        text="Cancel"
        type="tertiary"
        testID="cancel-button"
        rounded
        onPress={navigate("matchOptions")}
      />
      <Dialog.Close
        displayWhenAdapted
        asChild
      >
        <MyButton
          text="Yes"
          type="danger"
          rounded
          paddingHorizontal="$6"
          onPress={handleUnmatch}
        />
      </Dialog.Close>
    </XStack>
  );
};

const UnmatchDialogFooter = () => {
  return null;
};

const unmatchDialogInfo: DialogInfo = {
  title: "Unmatch",
  titleHidden: false,
  description: "Are you sure you want to unmatch?",
  descriptionHidden: false,
  snapPoints: undefined,
  snapPointsMode: "mixed",
  noScrollableBody: true,
  footerInBody: false,
  customFooter: true
};

const unmatchDialogScreen: DialogScreen = {
  dialogInfo: unmatchDialogInfo,
  body: UnmatchDialogBody,
  footer: UnmatchDialogFooter
};

export default unmatchDialogScreen;
