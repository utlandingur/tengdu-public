import { useState } from "react";
import { Linking } from "react-native";
import Typewriter from "react-native-typewriter";
import AppleSigninButton from "components/inputs/AppleSigninButton";
import { useRouter } from "expo-router";
import { H1, H2, H5, Separator, Stack, Text, XStack, YStack } from "tamagui";

import GoogleSigninButton from "../components/inputs/GoogleSigninButton";
import MyButton from "../components/inputs/MyButton";
import { PageWrapper } from "../components/PageWrapper";

export default function LandingPage() {
  const router = useRouter();

  return (
    <PageWrapper backgroundColor={"$colorTransparent"}>
      <YStack
        height={"100%"}
        paddingBottom={"$true"}
      >
        <YStack
          justifyContent="flex-start"
          //   height={"33%"}
          height={"40%"}
          gap={"$true"}
          paddingBottom={"$true"}
        >
          <H2
            textAlign="center"
            color={"$green"}
            size={"$10"}
          >
            tengdu
          </H2>
          <Hero />
        </YStack>
        <YStack
          paddingTop={"$true"}
          justifyContent="space-around"
          flex={1}
          space={"$true"}
          alignContent="center"
        >
          <YStack
            gap="$4"
            alignSelf="center"
            width={"80%"}
          >
            <GoogleSigninButton />
            <AppleSigninButton />

            <SeparatorLine />

            <MyButton
              type="primary"
              rounded
              onPress={() => router.navigate("/signup")}
              text="Create an account"
              testID="go-to-create-account"
            />
          </YStack>

          <YStack
            gap="$4"
            alignSelf="center"
            width={"80%"}
          >
            <H5
              textAlign="center"
              fontWeight={"700"}
            >
              Already have an account?
            </H5>
            <MyButton
              type="tertiary"
              rounded
              onPress={() => router.navigate("/signin")}
              text="Sign in"
              testID="go-to-signin"
            />
          </YStack>
          <YStack>
            <Text
              textAlign="center"
              onPress={() =>
                Linking.openURL("https://tengdu.app/policies/termsOfService")
              }
            >
              By using the app you agree to our Terms of Service and Privacy
              Policy.
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </PageWrapper>
  );
}

const SeparatorLine = () => {
  const SEPARATOR_HEIGHT = 20;

  return (
    <XStack
      gap="$2.5"
      alignContent="center"
      backgroundColor={"$gray"}
      minHeight={SEPARATOR_HEIGHT}
    >
      <Separator
        height={SEPARATOR_HEIGHT / 2}
        maxHeight={"100%"}
      />
      <Text textAlign="center">OR</Text>
      <Separator
        height={SEPARATOR_HEIGHT / 2}
        maxHeight={"100%"}
      />
    </XStack>
  );
};

const Hero = () => {
  const texts = [
    "play tennis",
    "play D&D",
    "dance",
    "hike",
    "rock climb",
    "run a 10k",
    "travel",
    "swim",
    "camp",
    "fish",
    "eat out",
    "shop",
    "party",
    "play rugby"
  ];

  const [index, setIndex] = useState(0);
  const [text, setText] = useState(texts[index]);
  const [typing, setTyping] = useState(1);

  const handleOnTyped = () => {
    switch (typing) {
      case 1:
        setTimeout(() => {
          setTyping((prev) => (prev === 1 ? -1 : 1));
        }, 1000);
        break;
      case -1:
        setTyping(1);
        setIndex((prev) => (prev + 1) % texts.length);
        setText(texts[index]);
        break;
    }
  };

  return (
    <Stack
      backgroundColor={"#F7F7F7"}
      borderRadius={8}
      paddingHorizontal={"$4"}
      paddingVertical={"$2"}
      justifyContent="flex-start"
    >
      <YStack>
        <H1 color={"$green"}>
          <Text>Find someone to </Text>
          <Typewriter
            typing={typing}
            onTypingEnd={handleOnTyped}
          >
            {text}
          </Typewriter>
          <Text> with.</Text>
        </H1>
      </YStack>
    </Stack>
  );
};
