import { PropsWithChildren } from "react";
import { TextStyle } from "react-native";
import {
  DeepPartial,
  OverlayProvider,
  Streami18n,
  Theme as StreamChatTheme
} from "stream-chat-expo";

import { colors, nunitoFace } from "../../GLOBAL_VALUES";
import { StreamChatGenerics } from "../../models/chat";

const sharedTextStyle: TextStyle = {
  fontFamily: nunitoFace.normal.normal
};

const streami18n = new Streami18n({
  language: "en"
});

const theme: DeepPartial<StreamChatTheme> = {
  channelListSkeleton: {
    container: {
      height: "100%"
    }
  },
  // Very obscure naming, but this colours various components in chat UI
  colors: {
    accent_blue: colors.primaryBackground,
    white_snow: colors.white,
    black: colors.black,
    border: colors.placeholder,
    grey_gainsboro: colors.placeholder,
    grey_whisper: colors.placeholder,
    grey: colors.secondaryBackground,
    grey_dark: colors.primaryBackground,
    bg_gradient_end: colors.placeholder,
    bg_gradient_start: colors.placeholder,
    white: colors.white,
    overlay: colors.secondaryBackground
  },
  messageSimple: {
    reactionList: {
      // iconFillColor: { ___ } // this is the colour of the reaction icons, but can only be set on main message view
    },
    content: {
      messageUser: { ...sharedTextStyle }
    }
  },
  overlay: {
    messageActions: {
      title: { ...sharedTextStyle }
    },
    reactionsList: {
      // reactionList: { ___ } // This is the background color of the bubble containing the reaction list
    }
  },
  thread: {
    newThread: {}
  }
};

const style = { style: theme };

export const ChatOverlay = ({ children }: PropsWithChildren) => {
  return (
    <OverlayProvider<StreamChatGenerics>
      i18nInstance={streami18n}
      value={style}
    >
      {children}
    </OverlayProvider>
  );
};
