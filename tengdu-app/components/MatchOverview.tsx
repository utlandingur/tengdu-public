import AvailabilityView from "components/inputs/AvailabilityView";
import MyButton from "components/inputs/MyButton";
import ItemList from "components/ItemList";
import UserAvatarList from "components/UserAvatarList";
import { useRouter } from "expo-router";
import { confirmMatch } from "firebaseFunctions";
import { useSession } from "providers/AuthProvider";
import { useChatClient } from "providers/ChatClientProvider";
import { useChatContext } from "providers/ChatProvider";
import { useMatchInfo } from "providers/MatchInfoProvider";
import { H3, H4, ScrollView, Text, YStack } from "tamagui";

const ProfileOverview = () => {
  const { match, users } = useMatchInfo();
  const { setChannel } = useChatContext();
  const { user } = useSession();
  const chatClient = useChatClient();
  const router = useRouter();

  if (!match) {
    return null;
  }

  const {
    chatId,
    sharedAvailability,
    sharedInterests,
    locations,
    date,
    id: matchId
  } = match;

  const Title = () => {
    return <H3>Say hello to...</H3>;
  };

  const handleOnPress = async () => {
    try {
      const filters = {
        id: { $eq: chatId },
        members: { $in: [user.uid] }
      };
      const [existingChannel] = await chatClient.queryChannels(filters);
      if (existingChannel) {
        setChannel(existingChannel);
        await confirmMatch(matchId, user.uid);
        router.navigate(`/chat/channel/${chatId}`);
      }
    } catch (error) {
      console.error("Error handling chat navigation: ", error);
    }
  };

  return (
    // might be worth extracting the mask and gradient into a separate wrapper component

    <>
      <ScrollView
        width={"100%"}
        space={"$6"}
        testID="profile-overview-scroll"
        showsVerticalScrollIndicator={false}
      >
        <Title />
        <UserAvatarList users={users} />
        <YStack gap="$4">
          <H4>You matched on... 👋</H4>
          <Text fontWeight={"$6"}>{date?.toDate().toDateString()}</Text>
        </YStack>
        {locations?.length > 0 && (
          <YStack gap="$4">
            <H4>You live in these locations... 🌏</H4>
            <ItemList
              items={locations.map((location) => location.description)}
              testId="locations"
            />
          </YStack>
        )}
        {sharedInterests?.length > 0 && (
          <YStack gap="$4">
            <H4>You are all interested in... 🤓</H4>
            <ItemList
              items={sharedInterests}
              testId="interests"
            />
          </YStack>
        )}
        {sharedAvailability && (
          <YStack gap="$4">
            <H4>You are all available... 📅</H4>
            <AvailabilityView availability={sharedAvailability} />
          </YStack>
        )}
        {match.chatId && (
          <MyButton
            // TODO
            // channel id should be same as match/group id so just navigate to .../channel/matchid
            // and that route should take then also create the channel if it doesnt exist
            onPress={handleOnPress}
            testID="chat-button"
            text="Go to chat"
            type="primary"
            marginTop={"$4"}
            marginBottom={"$10"}
          />
        )}
      </ScrollView>
    </>
  );
};

export default ProfileOverview;
