import { SafeAreaView, View } from "react-native";
import ThreeDotsMenu from "components/ThreeDotsMenu";
import { Stack, useRouter } from "expo-router";
import { StreamChatGenerics } from "models/chat";
import { useChatContext } from "providers/ChatProvider";
import { useMatches } from "providers/MatchProvider";
import { Channel, MessageInput, MessageList } from "stream-chat-expo";
export default function ChannelPage() {
  const router = useRouter();
  const { setThread, channel } = useChatContext();

  if (!channel) {
    return null;
  }

  const { matches } = useMatches();
  const match = matches.find((match) => match.chatId === channel.id);

  // if match is found, show three dots menu
  const threeDotsOnPress = () => {
    if (match?.id) {
      return (
        <ThreeDotsMenu
          onPress={() => router.navigate(`/chat/matches/${match.id}`)}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView>
      <Stack.Screen
        options={{
          title: "Chat",
          headerRight: threeDotsOnPress
        }}
      />
      {channel && (
        <Channel channel={channel}>
          <View style={{ flex: 1 }}>
            <MessageList<StreamChatGenerics>
              onThreadSelect={(thread) => {
                setThread(thread);
                router.navigate(
                  `/chat/channel/${channel.cid}/thread/${thread.cid}`
                );
              }}
            />
            <MessageInput />
          </View>
        </Channel>
      )}
    </SafeAreaView>
  );
}

// leaving here for reference, if we decide to create a custom message component
// its a lot of work so we should only do it if we really need to

//  Replace MessageList with the following:
// ------------------------------
{
  /* <MessageList
  Message={({ message }) => <MyCustomMessage message={message} />}
/>; */
}

// Create a custom message component
// ------------------------------
// interface MyCustomMessageProps {
//   message: MessageType<DefaultStreamChatGenerics>;
// }

// const MyCustomMessage = ({ message }: MyCustomMessageProps) => {
//   // Access message properties like text, sender, etc.

//   // Implement your custom message rendering logic here
//   return (
//     <View>
//       <Text style={{ fontFamily: "Roboto" }}>blah</Text>
//       <Text>blah</Text>
//
//     </View>
//   );
// };
