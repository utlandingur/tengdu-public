import { Image } from "react-native";
import { useSession } from "providers/AuthProvider";

import MyButton from "./MyButton";

const GoogleSigninButton = () => {
  const { signInWithGoogle } = useSession();

  return (
    <MyButton
      type="tertiary"
      rounded
      onPress={signInWithGoogle}
      color="#1f1f1f"
    >
      <Image
        source={require("../../assets/Images/google-logo.png")}
        style={{ width: 24, height: 24 }}
      />
      Continue with Google
    </MyButton>
  );
};

export default GoogleSigninButton;
