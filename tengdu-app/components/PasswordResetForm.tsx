import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Paragraph, YStack } from "tamagui";

import { useSession } from "../providers/AuthProvider";
import { isValidEmail } from "../utils/verificationUtils";

import MyButton from "./inputs/MyButton";
import TextInput from "./inputs/TextInput";
import { MyStack } from "./MyStack";

const isString = (param: string | string[]): param is string => {
  return typeof param === "string";
};

function PasswordResetForm() {
  const searchParams = useLocalSearchParams();
  let passedEmail = "";
  // to make typescript happy that email is a string not a string[]
  if (isString(searchParams.email)) {
    passedEmail = searchParams.email;
  }

  const [email, setEmail] = useState(passedEmail);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const { resetPassword } = useSession();

  const handleSubmit = async () => {
    setPending(true);

    if (!isValidEmail(email)) {
      setError(true);
      setErrorMessage("Please enter a valid email address");
      setPending(false);

      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(true);
      setErrorMessage(error.message);
    }
    setPending(false);
  };

  if (success) {
    return (
      <MyStack>
        <YStack
          justifyContent="center"
          alignContent="center"
        >
          <Paragraph
            testID="success-message"
            fontStyle="normal"
            textAlign="center"
          >
            Link to reset password sent to {email}
          </Paragraph>
        </YStack>
        <YStack justifyContent="center">
          <MyButton
            type="primary"
            testID="password-success-login-button"
            onPress={() => {
              router.navigate("/signin");
            }}
            rounded
          >
            Back to login
          </MyButton>
        </YStack>
      </MyStack>
    );
  }

  return (
    <MyStack space="$4">
      <YStack testID="password-reset-form">
        <TextInput
          label="Email"
          id="reset-password-email-input"
          state={email}
          setState={setEmail}
          errorMessage={errorMessage}
          error={error}
        />
      </YStack>
      <YStack justifyContent="center">
        <MyButton
          type="primary"
          onPress={handleSubmit}
          testID="reset-password-button"
          disabled={pending}
          rounded
        >
          Reset Password
        </MyButton>
      </YStack>
      <YStack justifyContent="center">
        <MyButton
          type="tertiary"
          testID="back-to-login-button"
          onPress={() => {
            router.navigate("/signin");
          }}
          rounded
          noBorder
        >
          Back to login
        </MyButton>
      </YStack>
    </MyStack>
  );
}

export default PasswordResetForm;
