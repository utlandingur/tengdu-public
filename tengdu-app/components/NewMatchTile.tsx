import UserAvatar from "components/UserAvatar";
import { useRouter } from "expo-router";
import { useMatch } from "hooks/useMatch";
import { MatchInfo } from "models/user";
import { Image, Text, XStack, YStack } from "tamagui";
import { shortestName } from "utils/dataManipulationUtils";

interface newMatchTileProps {
  match: MatchInfo | null;
}

const DIAMETER = 60;
const RADIUS = DIAMETER / 2;

const NewMatchTile = ({ match }: newMatchTileProps) => {
  if (!match) {
    return null;
  }
  const router = useRouter();
  const { users: matchedUsers } = useMatch(match.id);
  if (!matchedUsers || matchedUsers.length < 1) {
    return null;
  }

  const tileText = matchedUsers && (
    <Text
      textAlign="center"
      fontWeight={"400"}
      fontSize={"$4"}
      testID="match-text"
    >
      {shortestName(matchedUsers)}
    </Text>
  );

  const handleOnPress = () => {
    router.navigate(`/chat/matches/${match?.id}`);
  };

  return (
    <YStack
      gap={4}
      onPress={handleOnPress}
    >
      {/* could make a reusable component in future, and reuse with NewMatchtile */}

      <XStack
        backgroundColor="white"
        position="relative"
        width={DIAMETER}
        maxWidth={DIAMETER}
      >
        <UserAvatar
          photoURL={matchedUsers ? matchedUsers[0].photoURL : null}
          uid={matchedUsers ? matchedUsers[0].uid : null}
          borderRadius={RADIUS}
          testId="match"
          width={DIAMETER}
          maxWidth={DIAMETER}
          height={DIAMETER}
          alignSelf="center"
          zIndex={1}
          padding={1}
        />
      </XStack>
      {tileText}
    </YStack>
  );
};

export const NoMatchTile = () => {
  const binocularsGraphic = require("../assets/Images/no-match.png");

  const tileText = (
    <Text
      textAlign="center"
      fontWeight={"400"}
      fontSize={"$4"}
      maxWidth={DIAMETER}
      width={DIAMETER}
      testID="match-text"
    >
      searching...
    </Text>
  );

  return (
    <YStack
      gap={4}
      testID="no-match-tile"
    >
      <XStack
        backgroundColor="white"
        position="relative"
        width={DIAMETER}
        maxWidth={DIAMETER}
      >
        <Image
          source={{
            uri: binocularsGraphic
          }}
          width={DIAMETER}
          maxWidth={DIAMETER}
          height={DIAMETER}
          alignSelf="center"
          borderRadius={RADIUS}
        />
      </XStack>
      {tileText}
    </YStack>
  );
};

export default NewMatchTile;
