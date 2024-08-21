import { useState } from "react";
import KeyboardAvoidingComponent from "components/KeyboardAvoidingComponent";
import { Link, useRouter } from "expo-router";
import { Form, XStack, YStack } from "tamagui";

import { useSession } from "../providers/AuthProvider";
import { isValidEmail } from "../utils/verificationUtils";

import MyButton from "./inputs/MyButton";
import TextInput from "./inputs/TextInput";

const SignInForm = () => {
  const router = useRouter();
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [isEmailError, setIsEmailError] = useState(false);
  const errorMessageEmail = "Invalid login credentials";

  const [password, setPassword] = useState("");
  const [isPasswordError, setIsPasswordError] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleOnSubmit = async () => {
    setSubmitting(true);
    if (isValidEmail(email) && password.length > 0) {
      await signIn(email, password)
        .then((success) => {
          if (success) {
            router.navigate("/chat");
          }
        })
        .catch((error) => {
          setIsEmailError(true);
          setIsPasswordError(true);
        });
    } else {
      setIsEmailError(true);
      setIsPasswordError(true);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Form
        onSubmit={handleOnSubmit}
        gap={"$true"}
      >
        <KeyboardAvoidingComponent>
          <YStack gap="$true">
            <TextInput
              label="Email"
              id="sign-in-email-input"
              state={email}
              setState={setEmail}
              errorMessage={errorMessageEmail}
              error={isEmailError}
              setError={setIsEmailError}
            />

            <TextInput
              label="Password"
              id="sign-in-password-input"
              state={password}
              setState={setPassword}
              error={isPasswordError}
              setError={setIsPasswordError}
              textContentType="password"
              secureTextEntry
            />
          </YStack>
        </KeyboardAvoidingComponent>

        <XStack
          justifyContent="flex-end"
          paddingTop="$0"
        >
          <Link
            testID="forgot-password-link"
            href={{ pathname: "/resetPassword", params: { email } }}
          >
            Forgot password
          </Link>
        </XStack>
        <Form.Trigger asChild>
          <MyButton
            rounded
            type="primary"
            testID="sign-in-button"
            text="Sign in"
            submittingState={submitting}
          />
        </Form.Trigger>
      </Form>
      <YStack
        paddingBottom="$true"
        paddingTop="$true"
        gap="$4"
      >
        <MyButton
          rounded
          testID="signin-cancel-button"
          type="tertiary"
          onPress={() => {
            router.replace("/landingPage");
          }}
          noBorder
          text="Cancel"
        />
      </YStack>
    </>
  );
};

export default SignInForm;
