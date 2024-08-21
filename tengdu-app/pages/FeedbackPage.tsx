import { useState } from "react";
import { Linking } from "react-native";
import { Form } from "@tamagui/form";
import { YStack } from "@tamagui/stacks";
import { H2, Paragraph, SizableText } from "@tamagui/text";
import KeyboardAwareScrollView from "components/KeyboardAwareScrollView";
import { useFocusEffect } from "expo-router";
import { TextArea } from "tamagui";

import { uploadFeedback } from "..//db/feedback";
import MyButton from "../components/inputs/MyButton";
import { PageWrapper } from "../components/PageWrapper";
import { useSession } from "../providers/AuthProvider";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<string>();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { user } = useSession();

  // Reset the form when the user leaves the screen if feedback was submitted
  useFocusEffect(() => {
    return () => {
      if (submitted) {
        setSubmitted(false);
      }
    };
  });

  return (
    <PageWrapper>
      <YStack space={"$true"}>
        <H2>Provide feedback</H2>
        {submitted ? (
          <Paragraph>
            Thanks for providing your feedback and helping us to improve the
            Tengdu experience!
          </Paragraph>
        ) : (
          <KeyboardAwareScrollView navBarOnScreen>
            <Form
              onSubmit={() => {
                uploadFeedback(feedback, user.uid);
                setSubmitted(true);
              }}
              space={"$true"}
            >
              <TextArea
                placeholder="I would like to share..."
                onChangeText={setFeedback}
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Form.Trigger asChild>
                <MyButton
                  type="primary"
                  rounded
                >
                  Send
                </MyButton>
              </Form.Trigger>
              <Paragraph>
                You can also send us an email at{" "}
                <SizableText
                  theme="alt1"
                  onPress={() => {
                    Linking.openURL("mailto:info@tengdu.app");
                  }}
                >
                  info@tengdu.app
                </SizableText>
              </Paragraph>
            </Form>
          </KeyboardAwareScrollView>
        )}
      </YStack>
    </PageWrapper>
  );
}
