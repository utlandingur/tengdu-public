import { SafeAreaView, View } from "react-native";
import { Stack } from "expo-router";
import { useChatContext } from "providers/ChatProvider";
import { Channel, Thread } from "stream-chat-expo";

export default function ThreadScreen() {
  const { channel, thread, setThread } = useChatContext();

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Thread", headerBackTitle: "Chat" }} />

      <Channel
        channel={channel}
        thread={thread}
        threadList
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-start"
          }}
        >
          <Thread
            onThreadDismount={() => {
              setThread(undefined);
            }}
          />
        </View>
      </Channel>
    </SafeAreaView>
  );
}
