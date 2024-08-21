import { Keyboard } from "react-native";
import InputLabel from "components/InputLabel";
import { Input, InputProps, Label, Text, XStack, YStack } from "tamagui";

type textContentType =
  | "none"
  | "URL"
  | "addressCity"
  | "addressCityAndState"
  | "addressState"
  | "countryName"
  | "creditCardNumber"
  | "emailAddress"
  | "familyName"
  | "fullStreetAddress"
  | "givenName"
  | "jobTitle"
  | "location"
  | "middleName"
  | "name"
  | "namePrefix"
  | "nameSuffix"
  | "nickname"
  | "organizationName"
  | "postalCode"
  | "streetAddressLine1"
  | "streetAddressLine2"
  | "sublocality"
  | "telephoneNumber"
  | "username"
  | "password"
  | "oneTimeCode";

interface TextInputProps extends InputProps {
  state: string;
  setState: (state: string) => void;
  label: string;
  error?: boolean;
  setError?: (error: boolean) => void;
  errorMessage?: string;
  textContentType?: textContentType;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  testId?: string;
}

const TextInput = (props: TextInputProps) => {
  const {
    state,
    error,
    setError,
    setState,
    label,
    errorMessage,
    textContentType,
    secureTextEntry,
    autoCapitalize,
    multiline,
    testID
  } = props;

  const handleOnChangeText = (newText) => {
    setError && setError(false);
    setState(newText);
  };

  return (
    <YStack>
      <InputLabel
        label={label}
        error={error}
        errorMessage={errorMessage}
        testID={testID}
      />
      <Input
        id={label}
        testID={`${label}-input`}
        onChangeText={handleOnChangeText}
        textContentType={textContentType ?? "oneTimeCode"}
        theme={error ? "red" : undefined}
        value={state}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ? autoCapitalize : "none"}
        multiline={multiline}
        onSubmitEditing={multiline ? null : Keyboard.dismiss}
        // blurOnSubmit
        {...props}
      />
    </YStack>
  );
};

export default TextInput;

// TODO investigate if we want to use this
// autoCapitalize="none"
// {...(Platform.OS === "web"
//   ? { inputMode: "email", enterKeyHint: "next" }
//   : { keyboardType: "email-address", returnKeyType: "next" })}
