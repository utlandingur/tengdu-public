import { useCallback, useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import MySpinner from "components/CentredSpinner";
import * as ImagePicker from "expo-image-picker";
import { Text, XStack, YStack } from "tamagui";

import { colors, IMAGE_PICKER_IMAGE_BORDER_RADIUS } from "../../GLOBAL_VALUES";
import { onPressStyles } from "../../tamagui.config";

import MyButton from "./MyButton";

interface MyImagePickerProps {
  defaultUrl?: string;
  onChange: (uri: string) => void;
  withButton?: boolean;
}

export default function MyImagePicker({
  withButton,
  onChange,
  defaultUrl
}: MyImagePickerProps) {
  const [image, setImage] = useState(defaultUrl ?? null);
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = useCallback(async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
      setImage(result.assets[0].uri);
    }
  }, [onChange]);

  return (
    <XStack
      gap="$true"
      justifyContent="space-between"
      alignItems="center"
    >
      <TouchableOpacity
        onPress={pickImage}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        {image ? (
          <YStack
            alignContent="center"
            justifyContent="center"
            gap="$1"
          >
            <YStack
              style={[
                { width: 80, height: 80 },
                isPressed ? onPressStyles.transform : {}
              ]}
              backgroundColor={colors.white}
              borderRadius={IMAGE_PICKER_IMAGE_BORDER_RADIUS}
              borderColor={"$border"}
              shadowColor={"$shadow"}
              shadowOpacity={0.5}
              shadowRadius={1}
              shadowOffset={{ width: 0, height: 2 }}
            >
              <Image
                source={{ uri: image }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: IMAGE_PICKER_IMAGE_BORDER_RADIUS
                }}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                testID="ImagePreview"
              />
              {isLoading && <MySpinner />}
            </YStack>
          </YStack>
        ) : (
          <YStack
            style={[
              { width: 80, height: 80 },
              isPressed ? { transform: [{ scale: 0.95 }] } : {}
            ]}
            backgroundColor={"$backgroundFocus"}
            borderRadius={IMAGE_PICKER_IMAGE_BORDER_RADIUS}
            borderColor={"$border"}
            shadowColor={"$shadow"}
            shadowOpacity={0.5}
            shadowRadius={1}
            shadowOffset={{ width: 0, height: 2 }}
            justifyContent="center"
            alignContent="center"
          >
            <Text
              fontWeight={"300"}
              fontSize={"$1"}
              textAlign="center"
              testID="AddImageText"
            >
              Add image
            </Text>
          </YStack>
        )}
      </TouchableOpacity>
      {withButton && (
        <MyButton
          type="primary"
          rounded
          onPress={pickImage}
          testID="AddImageButton"
        >
          Add image
        </MyButton>
      )}
    </XStack>
  );
}
