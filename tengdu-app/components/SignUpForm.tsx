import { useState } from "react";
import { YStack } from "@tamagui/stacks";
import { Redirect, useRouter } from "expo-router";
import { CheckedState, Form } from "tamagui";

import { useSession } from "../providers/AuthProvider";

import CheckboxInput from "./inputs/CheckboxInput";
import MyButton from "./inputs/MyButton";
import TextInput from "./inputs/TextInput";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, user } = useSession();

  const [email, setEmail] = useState("");
  const [isEmailError, setIsEmailError] = useState(false);
  const [errorMessageEmail, setErrorMessageEmail] = useState<
    undefined | "Invalid email" | "Missing email" | "Email already exists"
  >(undefined);

  const [password, setPassword] = useState("");
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [errorMessagePassword, setErrorMessagePassword] = useState<
    undefined | "Weak password" | "Missing password"
  >(undefined);

  const [checked, setChecked] = useState<CheckedState>(false);
  const [isCheckError, setIsCheckError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnSubmit = () => {
    // check if checkbox is checked
    if (!checked) {
      setIsCheckError(true);
      return;
    } else {
      setIsCheckError(false);
      setIsSubmitting(true);
      signUp(email, password)
        .then((user) => {
          if (user.uid) {
            router.navigate("/");
          }
        })
        .catch((error: Error) => {
          // check email
          if (error.message.includes("email")) {
            setIsEmailError(true);

            if (error.message.includes("email-already-in-use")) {
              setErrorMessageEmail("Email already exists");
            } else if (error.message.includes("invalid-email")) {
              setErrorMessageEmail("Invalid email");
            } else if (error.message.includes("missing-email")) {
              setErrorMessageEmail("Missing email");
            }
          } else {
            setIsEmailError(false);
          }

          // check password
          if (error.message.includes("password")) {
            setIsPasswordError(true);

            if (error.message.includes("weak-password")) {
              setErrorMessagePassword("Weak password");
            } else if (error.message.includes("missing-password")) {
              setErrorMessagePassword("Missing password");
            }
          } else {
            setIsPasswordError(false);
          }
        });
    }
    setIsSubmitting(false);
  };

  if (user) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Form
        gap={"$true"}
        onSubmit={handleOnSubmit}
      >
        <YStack gap={"$true"}>
          <TextInput
            label="Email"
            id="sign-up-email-input"
            errorMessage={errorMessageEmail}
            error={isEmailError}
            state={email}
            setError={setIsEmailError}
            setState={setEmail}
          />
          <TextInput
            label="Password"
            id="sign-up-password-input"
            errorMessage={errorMessagePassword}
            setError={setIsPasswordError}
            error={isPasswordError}
            state={password}
            setState={setPassword}
            textContentType="password"
            secureTextEntry={true}
          />
        </YStack>
        <CheckboxInput
          testName="agree-to-terms"
          label="Agree with Tengdu's Terms of Service, Privacy Policy and default
          Notification Settings"
          setChecked={setChecked}
          error={isCheckError}
          setError={setIsCheckError}
          labelLink="https://tengdu.app/terms-of-service.html"
        />
        <Form.Trigger
          asChild
          testID="create-account-trigger"
          disabled={isSubmitting}
        >
          <MyButton
            type="primary"
            rounded
            testID="create-account-button"
            text="Create account"
            submittingState={isSubmitting}
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
          testID="signup-cancel-button"
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
}
