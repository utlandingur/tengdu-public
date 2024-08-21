import React, { createContext, useContext } from "react";
import CentredSpinner from "components/CentredSpinner";
import { useCreateChatClient } from "hooks/useCreateChatClient";
import { StreamChatGenerics } from "models/chat";
import { useSession } from "providers/AuthProvider";
import { StreamChat } from "stream-chat";
import { Chat, Streami18n } from "stream-chat-expo";

const streami18n = new Streami18n({
  language: "en"
});

type ChatClientContextType<
  SCG extends StreamChatGenerics = StreamChatGenerics
> = StreamChat<SCG> | null;

// Create a context for the chat client
const ChatClientContext = createContext<ChatClientContextType>(null);

// Create a provider component
export function ChatClientProvider(props: React.PropsWithChildren) {
  const { user } = useSession();
  const chatClient = useCreateChatClient();

  if (!user) {
    return props.children;
  }

  if (!chatClient) {
    return <CentredSpinner />;
  }
  return (
    <ChatClientContext.Provider value={chatClient}>
      <Chat
        client={chatClient}
        i18nInstance={streami18n}
      >
        {props.children}
      </Chat>
    </ChatClientContext.Provider>
  );
}

// Create a custom hook that components can use to access the chat client
export const useChatClient = <
  SCG extends StreamChatGenerics = StreamChatGenerics
>() => {
  const value = useContext(ChatClientContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useChatClient must be used within a ChatClientProvider");
    }
  }
  return value as StreamChat<SCG> | null;
};
