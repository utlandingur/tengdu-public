import { useEffect, useRef, useState } from "react";
import { useHandleAppState } from "hooks/useHandleAppState";
import { ChatSession, StreamChatGenerics } from "models/chat";
import { useSession } from "providers/AuthProvider";
import { useNotificationProvider } from "providers/NotificationProvider";
import { StreamChat } from "stream-chat";
import { registerOrRemoveDevice } from "utils/chatUtils";

// for creating the initial instance of the chat client
export const useCreateChatClient = <
  SCG extends StreamChatGenerics = StreamChatGenerics
>() => {
  const { notificationsEnabled, firebaseToken } = useNotificationProvider();

  const { chatSession, user } = useSession();

  const [chatClient, setChatClient] = useState<StreamChat<SCG> | null>(null);
  const userConnectedRef = useRef(false);
  const prevSessionRef = useRef<ChatSession | null>(null);
  const [connecting, setConnecting] = useState(false);

  const disconnectUser = async () => {
    try {
      await chatClient.disconnectUser();
      userConnectedRef.current = false;
    } catch (error) {
      console.error(error);
    }
  };

  const connectUser = async (doRegisterDevice?: boolean) => {
    if (user && !connecting) {
      setConnecting(true);
      const { userData, tokenOrProvider } = chatSession;
      try {
        await chatClient.connectUser(userData, tokenOrProvider);
        userConnectedRef.current = true;
      } catch (error) {
        console.error("Chat connection failed. Reason: ", error);
      }
      if (doRegisterDevice) {
        await registerOrRemoveDevice(
          userConnectedRef.current,
          chatClient,
          notificationsEnabled,
          firebaseToken,
          userData.id
        );
      }
    }
    setConnecting(false);
  };

  // When the app comes to the foreground, connect the user to chat
  const handleChangeToActiveState = async () => {
    if (chatClient && chatSession && !userConnectedRef.current) {
      await connectUser();
    }
  };

  // When the app goes to the background or inactive, disconnect the user from chat
  const handleChangeToNonActiveState = async () => {
    if (chatClient && userConnectedRef.current) {
      await disconnectUser();
    }
  };

  useHandleAppState({
    handleChangeToActiveState,
    handleChangeToNonActiveState
  });

  useEffect(() => {
    // If there is no session and the previous session exists, disconnect the user from chat
    // E.g. when the user logs out

    if (
      chatClient &&
      !chatSession &&
      prevSessionRef.current &&
      userConnectedRef.current
    ) {
      disconnectUser();
      return;
    }

    // if chatClient exists, connect the user
    if (chatClient && chatSession && !userConnectedRef.current) {
      connectUser(true);
    }

    // store the previous session to compare with the current one

    prevSessionRef.current = chatSession;

    // If there is no session, return early to avoid creating a new client

    if (!chatSession) {
      return;
    }

    // if chatClient doesnt exist, create one
    if (!chatClient) {
      const client = StreamChat.getInstance<SCG>(
        process.env.EXPO_PUBLIC_STREAM_CHAT_API_KEY
      );
      setChatClient(client);
    }
  }, [chatSession, chatClient, userConnectedRef.current]);

  return chatClient;
};
