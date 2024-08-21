import { useEffect, useState } from "react";
import { MyStack } from "components/MyStack";
import { loadAvatar } from "storage/userAvatar";
import { Image, ImageProps, Square } from "tamagui";

// TODO - implement react-native-face-detection to better align images on someones face

interface UserAvatarProps extends Omit<ImageProps, "source"> {
  uid?: string;
  photoURL?: string;
  testId?: string;
}

const userAvatar: string | null = null;

const UserAvatar = ({ uid, testId, photoURL, ...props }: UserAvatarProps) => {
  const [url, setUrl] = useState<string | undefined>(photoURL);

  if (!photoURL) {
    const load = async () => {
      const avatarURL = (await loadAvatar(uid)) as typeof userAvatar;
      setUrl(avatarURL);
    };

    // load the avatar when the component mounts
    useEffect(() => {
      load();
    }, []);
  }

  return (
    <MyStack
      width={"100%"}
      padding={1}
      {...props}
    >
      {url && (
        <Image
          testID={`${testId}-image`}
          source={{
            uri: url
          }}
          resizeMode="cover"
          borderRadius={props.borderRadius}
          flex={1}
        />
      )}
      {/* TODO - grab a better placeholder */}
      {!url && (
        <Square
          testID={`${testId}-image-placeholder`}
          backgroundColor="#f0f0f0"
          flex={1}
          zIndex={6}
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius={props.borderRadius}
        />
      )}
    </MyStack>
  );
};

export default UserAvatar;
