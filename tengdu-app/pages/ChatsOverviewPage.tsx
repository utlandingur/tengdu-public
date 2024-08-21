import { useCallback } from "react";
import NewMatchList from "components/NewMatchTiles";
import { PageWrapper } from "components/PageWrapper";
import { Stack, useRouter } from "expo-router";
import { useChatFilters } from "hooks/useChatFilters";
import { StreamChatGenerics } from "models/chat";
import { useChatClient } from "providers/ChatClientProvider";
import { useChatContext } from "providers/ChatProvider";
import { useMatches } from "providers/MatchProvider";
import { ChannelList } from "stream-chat-expo";
import { filterOnNewMessage } from "utils/chatUtils";

export default function ChatsOverviewPage() {
  const router = useRouter();
  const { setChannel } = useChatContext();

  const { newMatchesChatIds } = useMatches();

  const filters = useChatFilters(newMatchesChatIds);
  const chatClient = useChatClient();

  // if a new message is received in a newMatch we do not want to add the channel to the list
  // for channels being watched
  const onNewMessage = useCallback(
    (_lock, _setChannels, event) =>
      filterOnNewMessage(
        newMatchesChatIds,
        chatClient,
        _setChannels,
        event,
        "onNewMessage"
      ),
    [newMatchesChatIds]
  );

  // if a new message is received in a newMatch we do not want to add the channel to the list
  // for channels not being watched
  const onNewMessageNotification = useCallback(
    (_setChannels, event) =>
      filterOnNewMessage(
        newMatchesChatIds,
        chatClient,
        _setChannels,
        event,
        "onNewMessageNotification"
      ),
    [newMatchesChatIds]
  );

  return (
    <PageWrapper>
      <Stack.Screen
        options={{
          headerShown: false,
          title: "Chat"
        }}
      />

      <NewMatchList />

      <ChannelList<StreamChatGenerics>
        filters={filters}
        onNewMessage={onNewMessage}
        onNewMessageNotification={onNewMessageNotification}
        onSelect={(channel) => {
          setChannel(channel);
          router.navigate(`/chat/channel/${channel.cid}`);
        }}
      />
    </PageWrapper>
  );
}
