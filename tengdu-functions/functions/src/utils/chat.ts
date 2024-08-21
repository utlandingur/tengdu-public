import { StreamChat, DefaultGenerics } from "stream-chat";

const CHANNEL_TYPE = "messaging";

export const createMatchChannel = async (
  chatClient: StreamChat<DefaultGenerics>,
  users: string[],
): Promise<string> => {
  const channel = chatClient.channel(CHANNEL_TYPE, {
    members: users,
    created_by_id: "1",
  });
  await channel.create();
  return channel.id;
};

export const deleteChannel = async (
  chatClient: StreamChat<DefaultGenerics>,
  channelId: string,
) => {
  await chatClient.deleteChannels([channelId]);
};

export const removeUserFromChannel = async (
  chatClient: StreamChat<DefaultGenerics>,
  channelId: string,
  uid: string,
) => {
  await chatClient
    .getChannelById(CHANNEL_TYPE, channelId, {})
    .removeMembers([uid]);
};
