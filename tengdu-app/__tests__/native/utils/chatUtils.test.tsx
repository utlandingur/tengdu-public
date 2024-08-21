/* eslint-disable @typescript-eslint/no-empty-function */
import { StreamChat } from "stream-chat";
import * as chatUtils from "utils/chatUtils";
import {
  addNewChannel,
  filterOnNewMessage,
  registerDevice,
  registerOrRemoveDevice
} from "utils/chatUtils";

jest.mock("utils/chatUtils", () => {
  const realModule = jest.requireActual("utils/chatUtils");
  return {
    ...realModule
  };
});

jest.mock("stream-chat", () => {
  const realModule = jest.requireActual("stream-chat");

  return {
    StreamChat: {
      ...realModule.StreamChat,
      getInstance: jest.fn().mockImplementation(() => {
        const realInstance = new realModule.StreamChat("dummyKey");
        realInstance.getDevices = jest.fn();
        realInstance.addDevice = jest.fn();
        realInstance.removeDevice = jest.fn();
        return realInstance;
      })
    }
  };
});

const chatClient = StreamChat.getInstance("dummyKey");

const setChannels = jest.fn();
// const chatClient = new StreamChat("dummyKey");
const chatIdsToFilter = ["channel1"];
const event = { channel_id: "channel2", channel_type: "messaging" };

chatClient.channel = jest
  .fn()
  .mockReturnValue({ watch: jest.fn().mockResolvedValue({}) });

describe("filterOnNewMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("adds a new channel to the channels list", async () => {
    const event = { channel_id: "channel2", channel_type: "messaging" };

    await filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event);

    expect(setChannels).toHaveBeenCalled();
    expect(chatClient.channel).toHaveBeenCalledWith(
      event.channel_type,
      event.channel_id
    );
  });

  it("does not add a new channel if it is in the filter list", async () => {
    const chatIdsToFilterTest = ["channel2"];

    await filterOnNewMessage(
      chatIdsToFilterTest,
      chatClient,
      setChannels,
      event
    );

    expect(setChannels).not.toHaveBeenCalled();
  });

  it("handles null event", async () => {
    const eventNull = null;

    try {
      await filterOnNewMessage(
        chatIdsToFilter,
        chatClient,
        setChannels,
        eventNull
      );
    } catch (e) {
      expect(e).toEqual(new Error("Event is null or undefined"));
    }
    expect(setChannels).not.toHaveBeenCalled();
  });

  it("handles undefined chatIdsToFilter", async () => {
    const chatIdsToFilter = undefined;

    try {
      await filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event);
    } catch (e) {
      expect(e).toEqual(new Error("chatIdsToFilter is null or undefined"));
    }
    expect(setChannels).toHaveBeenCalledTimes(1);
  });

  it("handles null setChannels", async () => {
    const setChannelsNull = null;

    try {
      await filterOnNewMessage(
        chatIdsToFilter,
        chatClient,
        setChannelsNull,
        event
      );
    } catch (e) {
      expect(e).toEqual(new Error("setChannels is null or undefined"));
    }
  });

  it("handles null chatClient", async () => {
    const chatClient = null;

    try {
      await filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event);
    } catch (e) {
      expect(e).toEqual(new Error("chatClient is null or undefined"));
    }
  });

  it("throws an error when event.channel_id is null", async () => {
    const eventWithIdNull = { channel_id: null, channel_type: "messaging" };
    await expect(
      filterOnNewMessage(
        chatIdsToFilter,
        chatClient,
        setChannels,
        eventWithIdNull
      )
    ).rejects.toThrow("event.channel_id is null or undefined");
  });

  it("throws an error when event.channel_type is null", async () => {
    const eventWithTypeNull = { channel_id: "channel1", channel_type: null };
    await expect(
      filterOnNewMessage(
        chatIdsToFilter,
        chatClient,
        setChannels,
        eventWithTypeNull
      )
    ).rejects.toThrow("event.channel_type is null or undefined");
  });

  it("logs an error when newChannel.watch() fails", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    chatClient.channel = jest.fn().mockReturnValueOnce({
      watch: jest.fn().mockRejectedValue(new Error("watch failed"))
    });
    await filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("calls setChannels with a function that behaves like addNewChannel", async () => {
    chatClient.channel = jest
      .fn()
      .mockReturnValue({ watch: jest.fn().mockResolvedValue({}) });
    await filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event);

    // Check that setChannels was called with a function
    const setChannelsArg = setChannels.mock.calls[0][0];
    expect(typeof setChannelsArg).toBe("function");

    // Check that the callback function passed to setChannel behaves like addNewChannel
    const existingChannels = [{ id: "channel2" }, { id: "channel3" }];
    const newChannel = { id: "channel1", type: "messaging" };

    const newChannels = setChannelsArg(existingChannels);
    const expectedNewChannels = addNewChannel(
      existingChannels,
      newChannel,
      event.channel_id
    );

    expect(newChannels).toEqual(expectedNewChannels);
  });

  it("handles null return from chatClient.channel", async () => {
    chatClient.channel = jest.fn().mockReturnValue(null);

    await expect(
      filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event)
    ).rejects.toThrow("Channel is null or undefined");

    expect(setChannels).not.toHaveBeenCalled();
  });

  it("handles undefined return from chatClient.channel", async () => {
    chatClient.channel = jest.fn().mockReturnValue(undefined);

    await expect(
      filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event)
    ).rejects.toThrow("Channel is null or undefined");
  });

  it("handles channel without watch method", async () => {
    chatClient.channel = jest.fn().mockReturnValue({});

    await filterOnNewMessage(chatIdsToFilter, chatClient, setChannels, event);

    expect(setChannels).toHaveBeenCalledTimes(1);
  });
});

describe("addNewChannel", () => {
  it("adds newChannel to the beginning of the array if it does not exist", () => {
    const existingChannels = [{ id: "channel2" }, { id: "channel3" }];
    const newChannel = { id: "channel1", type: "messaging" };
    const eventChannelId = "channel1";

    const newChannels = addNewChannel(
      existingChannels,
      newChannel,
      eventChannelId
    );

    expect(newChannels).toEqual([newChannel, ...existingChannels]);
  });

  it("does not add newChannel if a channel with the same ID already exists", () => {
    const existingChannels = [
      { id: "channel1" },
      { id: "channel2" },
      { id: "channel3" }
    ];
    const newChannel = { id: "channel1", type: "messaging" };
    const eventChannelId = "channel1";

    const unchangedChannels = addNewChannel(
      existingChannels,
      newChannel,
      eventChannelId
    );

    expect(unchangedChannels).toEqual(existingChannels);
  });

  it("returns the original channels array if channels is not defined", () => {
    const newChannel = { id: "channel1", type: "messaging" };
    const eventChannelId = "channel1";

    const result = addNewChannel(undefined, newChannel, eventChannelId);

    expect(result).toEqual(undefined);
  });

  it("returns the original channels array if newChannel is null", () => {
    const existingChannels = [{ id: "channel2" }, { id: "channel3" }];
    const newChannel = null;
    const eventChannelId = "channel1";

    const result = addNewChannel(existingChannels, newChannel, eventChannelId);

    expect(result).toEqual(existingChannels);
  });

  it("returns the original channels array if newChannel is undefined", () => {
    const existingChannels = [{ id: "channel2" }, { id: "channel3" }];
    const newChannel = undefined;
    const eventChannelId = "channel1";

    const result = addNewChannel(existingChannels, newChannel, eventChannelId);

    expect(result).toEqual(existingChannels);
  });

  it("returns the original channels array if eventChannelId is null", () => {
    const existingChannels = [{ id: "channel2" }, { id: "channel3" }];
    const newChannel = { id: "channel1", type: "messaging" };
    const eventChannelId = null;

    const result = addNewChannel(existingChannels, newChannel, eventChannelId);

    expect(result).toEqual(existingChannels);
  });
});

describe("registerDevice", () => {
  const mockDeviceToken = "deviceToken";
  const mockPushProvider = "firebase";
  const mockUserId = "userId";
  const mockEnvironment = "production";

  let mockChatClient;

  beforeEach(() => {
    mockChatClient = StreamChat.getInstance("dummyKey");
    mockChatClient.getDevices.mockClear();
    mockChatClient.addDevice.mockClear();
  });

  it("registers a new device if it is not already registered", async () => {
    mockChatClient.getDevices.mockResolvedValue({ devices: [] });

    await registerDevice(
      mockChatClient,
      mockDeviceToken,
      mockPushProvider,
      mockUserId,
      mockEnvironment
    );

    expect(mockChatClient.addDevice).toHaveBeenCalledWith(
      mockDeviceToken,
      mockPushProvider,
      mockUserId,
      mockEnvironment
    );
  });

  it("does not register a device if it is already registered", async () => {
    mockChatClient.getDevices.mockResolvedValue({
      devices: [{ id: mockDeviceToken }]
    });

    await registerDevice(
      mockChatClient,
      mockDeviceToken,
      mockPushProvider,
      mockUserId,
      mockEnvironment
    );

    expect(mockChatClient.addDevice).not.toHaveBeenCalled();
  });

  it("logs an error if adding the device fails", async () => {
    mockChatClient.getDevices.mockResolvedValue({ devices: [] });
    mockChatClient.addDevice.mockRejectedValue(new Error("Test error"));

    const consoleSpy = jest.spyOn(console, "error");

    await registerDevice(
      mockChatClient,
      mockDeviceToken,
      mockPushProvider,
      mockUserId,
      mockEnvironment
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error registering device",
      new Error("Test error")
    );

    consoleSpy.mockRestore();
  });

  it("throws an error if fetching the devices fails", async () => {
    mockChatClient.getDevices.mockRejectedValue(new Error("Test error"));

    await expect(
      registerDevice(
        mockChatClient,
        mockDeviceToken,
        mockPushProvider,
        mockUserId,
        mockEnvironment
      )
    ).rejects.toThrow("Test error");
  });

  it("throws an error if deviceToken is empty", async () => {
    await expect(
      registerDevice(
        mockChatClient,
        "",
        mockPushProvider,
        mockUserId,
        mockEnvironment
      )
    ).rejects.toThrow();
  });

  it("throws an error if pushProvider is empty", async () => {
    await expect(
      registerDevice(
        mockChatClient,
        mockDeviceToken,
        undefined,
        mockUserId,
        mockEnvironment
      )
    ).rejects.toThrow();
  });

  it("throws an error if userId is empty", async () => {
    await expect(
      registerDevice(
        mockChatClient,
        mockDeviceToken,
        mockPushProvider,
        "",
        mockEnvironment
      )
    ).rejects.toThrow();
  });

  it("throws an error if environment is empty", async () => {
    await expect(
      registerDevice(
        mockChatClient,
        mockDeviceToken,
        mockPushProvider,
        mockUserId,
        ""
      )
    ).rejects.toThrow();
  });
});

describe("registerOrRemoveDevice", () => {
  let mockChatClient;

  const registerDeviceSpy = jest.spyOn(chatUtils, "registerDevice");

  beforeEach(() => {
    mockChatClient = StreamChat.getInstance("dummyKey");
    mockChatClient.getDevices = jest.fn().mockResolvedValue({ devices: [] });
    mockChatClient.addDevice.mockClear();
  });

  // it("calls registerDevice when userConnected and client are truthy and notificationsEnabled is true", async () => {
  //   // Arrange
  //   const userConnected = true;
  //   const notificationsEnabled = true;
  //   const deviceToken = "device-token";
  //   const userId = "user-id";

  //   // Act
  //   await registerOrRemoveDevice(
  //     userConnected,
  //     mockChatClient,
  //     notificationsEnabled,
  //     deviceToken,
  //     userId
  //   );

  //   // Assert
  //   expect(registerDeviceSpy).toHaveBeenCalledWith(
  //     mockChatClient,
  //     deviceToken,
  //     "firebase",
  //     userId,
  //     "production"
  //   );
  // });

  it("calls client.removeDevice when userConnected and client are truthy and notificationsEnabled is false", async () => {
    await registerOrRemoveDevice(
      true,
      mockChatClient,
      false,
      "device-token",
      "user-id"
    );

    expect(mockChatClient.removeDevice).toHaveBeenCalledWith("device-token");
  });

  // it("does not call registerDevice or client.removeDevice when userConnected is false", async () => {
  //   await registerOrRemoveDevice(
  //     false,
  //     mockChatClient,
  //     true,
  //     "device-token",
  //     "user-id"
  //   );

  //   expect(registerDeviceSpy).not.toHaveBeenCalled();
  //   expect(mockChatClient.removeDevice).not.toHaveBeenCalled();
  // });
});
