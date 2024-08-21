import React, { useState } from "react";
import { Channel } from "stream-chat";

export const ChatContext = React.createContext<{
  channel: Channel | null;
  setChannel: (channel) => void;
  thread;
  setThread: (thread) => void;
} | null>(null);

export function useChatContext() {
  const value = React.useContext(ChatContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useChatContext must be wrapped in a <ChatProvider />");
    }
  }

  return value;
}

export const ChatProvider = (props: React.PropsWithChildren) => {
  const [channel, setChannel] = useState<Channel>();
  const [thread, setThread] = useState<string>();

  return (
    <ChatContext.Provider value={{ channel, setChannel, thread, setThread }}>
      {props.children}
    </ChatContext.Provider>
  );
};
