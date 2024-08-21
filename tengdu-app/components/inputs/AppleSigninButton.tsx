import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import CentredSpinner from "components/CentredSpinner";
import MyButton from "components/inputs/MyButton";
import * as AppleAuthentication from "expo-apple-authentication";
import { useSession } from "providers/AuthProvider";

import { onPressStyles } from "../../tamagui.config";

export default function AppleSigninButton() {
  // only display on iOS
  if (Platform.OS !== "ios") {
    return null;
  }
  const { signInWithApple } = useSession();
  const [loading, setLoading] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    const checkAppleAuth = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(isAvailable);
    };

    checkAppleAuth();
  }, []);

  // set spinner whilst awaiting async function
  const handleOnPress = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } finally {
      setLoading(false);
    }
  };

  if (!appleAuthAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!loading && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={32}
          style={styles.button}
          onPress={handleOnPress}
          testID="apple-signin-button"
        />
      )}
      {loading && (
        // To mock the Apple sign in button
        <MyButton
          width={"100%"}
          rounded
          backgroundColor={"black"}
        >
          <CentredSpinner
            size="small"
            color="white"
          />
        </MyButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    width: "100%",
    height: 46
  },
  onPressStyles: {
    opacity: onPressStyles.opacity,
    transform: onPressStyles.transform
  }
});
