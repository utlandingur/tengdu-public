import { useState } from "react";
import MyButton from "components/inputs/MyButton";
import TextInput from "components/inputs/TextInput";
import KeyboardAwareScrollView from "components/KeyboardAwareScrollView";
import UserAvatarList from "components/UserAvatarList";
import { useRouter } from "expo-router";
import {
  DialogInfo,
  DialogScreen
} from "factoryFunctions/createNavigatorComponent";
import { MatchInfo, MatchedUsers } from "models/user";
import { H3, Paragraph, XStack, YStack } from "tamagui";

import { removeUserFromMatch, reportUsers } from "../../../firebaseFunctions";

interface ReportUserDialogBodyProps {
  matchInfo: { match: MatchInfo; users: MatchedUsers };
  navigate: (screen: string) => () => void;
}

export const ReportUserDialogBody = ({
  navigate,
  matchInfo
}: ReportUserDialogBodyProps) => {
  const [highlightedUsers, setHighlightedUsers] = useState<MatchedUsers>([]);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { match, users } = matchInfo;
  const router = useRouter();

  const handleReport = async () => {
    if (highlightedUsers?.length > 0 && reason?.length >= 50) {
      const uids = highlightedUsers.map((user) => user.uid) as string[];
      await reportUsers(uids, reason);
      await removeUserFromMatch(match.id);
      router.navigate("/chat");

      return;
    }

    if (highlightedUsers?.length === 0) {
      setError(true);
      setErrorMessage("Please select a user to report");
      return;
    }
    if (reason?.length < 50) {
      setError(true);
      setErrorMessage("Min 50 Characters");
      return;
    }
  };

  return (
    <KeyboardAwareScrollView>
      <YStack
        justifyContent="space-between"
        height={"100%"}
      >
        <YStack space="$true">
          <Paragraph>
            Reporting a user will remove you from the chat and you won&apos;t be
            able to match with them again. They won&apos;t know you reported
            them.
          </Paragraph>
          <YStack gap="$true">
            <H3>Select the user(s)</H3>
            <UserAvatarList
              users={users}
              highlightedUsers={highlightedUsers}
              setHighlightedUsers={setHighlightedUsers}
            />
          </YStack>
          <YStack>
            <TextInput
              label="Reason"
              state={reason}
              setState={setReason}
              error={error}
              setError={setError}
              errorMessage={errorMessage}
              multiline
              marginBottom="$4"
            />
          </YStack>
        </YStack>

        <XStack
          justifyContent="space-between"
          paddingTop="$true"
          paddingBottom="$8"
        >
          <MyButton
            text="Cancel"
            type="tertiary"
            testID="cancel-button"
            rounded
            onPress={navigate("matchOptions")}
          />
          <MyButton
            text="Report"
            rounded
            type="danger"
            opacity={
              highlightedUsers?.length > 0 && reason?.length >= 50 ? 1 : 0.5
            }
            testID="report-button"
            onPress={handleReport}
          />
        </XStack>
      </YStack>
    </KeyboardAwareScrollView>
  );
};

const ReportUserDialogFooter = () => {
  return null;
};

const reportDialogInfo: DialogInfo = {
  title: "Report",
  titleHidden: false,
  description: "Report a user for inappropriate behaviour.",
  descriptionHidden: false,
  snapPoints: [90],
  snapPointsMode: undefined,
  noScrollableBody: true,
  customFooter: true
};

const reportDialogScreen: DialogScreen = {
  dialogInfo: reportDialogInfo,
  body: ReportUserDialogBody,
  footer: ReportUserDialogFooter
};

export default reportDialogScreen;
