import { Label, Text, XStack } from "tamagui";

interface InputLabelProps {
  label: string;
  error?: boolean;
  errorMessage?: string;
  testID?: string;
}

const InputLabel = ({
  label,
  error,
  errorMessage,
  testID
}: InputLabelProps) => {
  return (
    <XStack
      justifyContent="space-between"
      width={"100%"}
      alignItems="center"
    >
      <Label
        testID={`${label}-label`}
        htmlFor={label}
      >
        <Text fontWeight="600">{label}</Text>
      </Label>
      {error && (
        <Text
          testID={`${testID ?? label}-error-message`}
          color="$dangerBackground"
        >
          {errorMessage}
        </Text>
      )}
    </XStack>
  );
};

export default InputLabel;
