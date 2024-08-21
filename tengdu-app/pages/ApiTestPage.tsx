import { useState } from "react";
import { Text } from "react-native";
import MyButton from "components/inputs/MyButton";
import { H4, YStack } from "tamagui";

import {
  removeMatch,
  removeUserFromMatch,
  reportUsers
} from "../firebaseFunctions";

const ApiTestPage = () => {
  return (
    <YStack gap="$8">
      <ApiTestButton
        name="Remove Match"
        func={async () => removeMatch("123")}
      />
      <ApiTestButton
        name="Remove User From Match"
        func={async () => removeUserFromMatch("123")}
      />
      <ApiTestButton
        name="Report Users"
        func={async () => reportUsers(["123"], "this is the reason for report")}
      />
    </YStack>
  );
};

interface ApiTestButtonProps {
  name: string;
  func: () => Promise<any> | Promise<void>;
}

const ApiTestButton = ({ name, func }: ApiTestButtonProps) => {
  const [result, setResult] = useState<string>(null);
  const [error, setError] = useState<Error>(null);
  const [response, setResponse] = useState<any>(null);

  const handleOnPress = async () => {
    try {
      const response = await func();
      setResult("Success");
      if (response) {
        setResponse(response);
      }
    } catch (error) {
      setResult("Failure");
      setError(error);
      console.error(error);
    }
  };

  return (
    <YStack>
      <H4>{name}</H4>
      {!result && (
        <MyButton
          type="secondary"
          rounded
          onPress={handleOnPress}
          text="Call Remove Match"
        />
      )}
      {result && <Text>Result: {result}</Text>}
      {result && !error && <Text>Response: {response}</Text>}
      {result && error && <Text>Error: {error.message}</Text>}
      {result && (
        <MyButton
          type="tertiary"
          rounded
          onPress={() => {
            setResult(null);
            setError(null);
            setResponse(null);
          }}
          text="Reset"
        />
      )}
    </YStack>
  );
};

export default ApiTestPage;
