import UserAvatar from "components/UserAvatar";
import { MatchedUsers, PublicUserInfo } from "models/user";
import { ScrollView, Text, XStack, YStack } from "tamagui";

interface UserAvatarListProps {
  users: PublicUserInfo[];
  highlightedUsers?: MatchedUsers; // state and set state must be passed together
  setHighlightedUsers?: (users: MatchedUsers) => void;
}

const UserAvatarList = ({
  users,
  highlightedUsers,
  setHighlightedUsers
}: UserAvatarListProps) => {
  if (!users) {
    return null;
  }

  const radius = 30;
  const diameter = 60;
  const highlighting =
    highlightedUsers && setHighlightedUsers && highlightedUsers.length > 0;
  let handleOnPress;
  if (highlightedUsers && setHighlightedUsers) {
    handleOnPress = (user: PublicUserInfo) => {
      const newHighlightedUsers = highlightedUsers.includes(user)
        ? highlightedUsers.filter((highlightedUser) => user !== highlightedUser)
        : [...highlightedUsers, user];

      setHighlightedUsers(newHighlightedUsers);
    };
  }

  return (
    <ScrollView
      horizontal
      width={"100%"}
      space={16}
      maxHeight={200}
      testID="user-avatars-scroll"
    >
      {users.map((user, index) => {
        let highlighted;
        if (highlighting) {
          highlighted = highlightedUsers.includes(user);
        }

        return (
          <YStack
            gap={4}
            key={user.uid || index}
            onPress={handleOnPress ? () => handleOnPress(user) : undefined}
          >
            <XStack
              backgroundColor="white"
              position="relative"
              justifyContent="center"
            >
              <UserAvatar
                uid={user.uid}
                photoURL={user.photoURL}
                testId={highlighted ? "highlighted-user-avatar" : "user-avatar"}
                borderRadius={radius}
                width={
                  diameter
                  // highlighting
                  //   ? highlighted
                  //     ? diameter + 15
                  //     : diameter
                  //   : diameter
                }
                maxWidth={
                  diameter
                  // highlighting
                  //   ? highlighted
                  //     ? diameter + 15
                  //     : diameter
                  //   : diameter
                }
                height={
                  diameter
                  // highlighting
                  //   ? highlighted
                  //     ? diameter + 15
                  //     : diameter
                  //   : diameter
                }
                alignSelf="center"
                opacity={highlighting ? (highlighted ? 1 : 0.3) : 1}
              />
            </XStack>
            <Text
              textAlign="center"
              fontWeight={highlighting ? (highlighted ? "700" : "400") : "400"}
              fontSize={"$4"}
              testID={highlighted ? "highlighted-user-text" : "match-text"}
            >
              {user.firstName}
            </Text>
          </YStack>
        );
      })}
    </ScrollView>
  );
};

export default UserAvatarList;
