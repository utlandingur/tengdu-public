import { StreamChatGenerics } from "models/chat";
import { Channel, Event, StreamChat } from "stream-chat";

interface customOnNewMessageProps {
  chatIdsToFilter: string[];
  chatClient: StreamChat<StreamChatGenerics>;
  setChannels: React.Dispatch<
    React.SetStateAction<Channel<StreamChatGenerics>[]>
  >;
  event: Event<StreamChatGenerics>;
  consoleLogString?: string;
}

export const filterOnNewMessage = async (
  chatIdsToFilter,
  chatClient,
  setChannels,
  event,
  consoleLogString?
): Promise<customOnNewMessageProps> => {
  if (!event) {
    throw new Error("Event is null or undefined");
  }
  if (!setChannels) {
    throw new Error("setChannels is null or undefined");
  }
  if (!chatClient) {
    throw new Error("chatClient is null or undefined");
  }
  if (!event.channel_id) {
    throw new Error("event.channel_id is null or undefined");
  }
  if (!event.channel_type) {
    throw new Error("event.channel_type is null or undefined");
  }

  const eventChannelId = event.channel_id;
  const eventChannelType = event.channel_type;

  if (chatIdsToFilter?.length > 0 && chatIdsToFilter.includes(eventChannelId)) {
    return;
  }

  const newChannel = chatClient.channel(eventChannelType, eventChannelId);
  if (!newChannel) {
    throw new Error("Channel is null or undefined");
  }
  try {
    await newChannel.watch();
  } catch (error) {
    // not important enough to throw an error
    console.error("Error watching channel", error);
  }

  setChannels((channels) =>
    addNewChannel(channels, newChannel, eventChannelId)
  );
};

// Add a new channel to the list of channels
// split out for testing and to keep code cleaner
export const addNewChannel = (channels, newChannel, eventChannelId) => {
  if (
    channels &&
    newChannel &&
    eventChannelId &&
    !channels.some((channel) => channel.id === eventChannelId)
  ) {
    return [newChannel, ...channels];
  }
  return channels;
};

export const registerDevice = async (
  client: StreamChat<SCG>,
  deviceToken: string,
  pushProvider: "firebase" | "apn",
  userId: string,
  environment: string
) => {
  // Fetch the list of devices currently registered for the user
  const devices = await client.getDevices();

  // Check if the device token is already registered
  const isDeviceRegistered = devices.devices.some(
    (device) => device.id === deviceToken
  );

  // If the device is not registered, add it
  if (!isDeviceRegistered) {
    try {
      await client.addDevice(deviceToken, pushProvider, userId, environment);
    } catch (error) {
      console.error("Error registering device", error);
    }
  }
};

export const registerOrRemoveDevice = async (
  userConnected: boolean,
  client: StreamChat<SCG>,
  notificationsEnabled: boolean,
  deviceToken: string,
  userId: string
) => {
  if (userConnected && client) {
    if (notificationsEnabled) {
      await registerDevice(
        client,
        deviceToken,
        "firebase",
        userId,
        "production"
      );
    } else {
      try {
        await client.removeDevice(deviceToken);
      } catch (error) {
        console.error("Error removing device: ", error);
      }
    }
  }
};
