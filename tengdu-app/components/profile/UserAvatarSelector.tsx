import MyImagePicker from "components/inputs/MyImagePicker";
import { useSession } from "providers/AuthProvider";
import { useProfile } from "providers/ProfileProvider";
import { uploadUserAvatar } from "storage/userAvatar";

interface UserAvatarSelectorProps {
  withButton?: boolean;
}

export default function UserAvatarSelector({
  withButton
}: UserAvatarSelectorProps) {
  const { user } = useSession();
  const { profile, updateProfile } = useProfile();

  const updateAvatar = async (uri: string) => {
    try {
      const url = await uploadUserAvatar(uri, user?.uid);
      updateProfile({
        photoURL: url
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error uploading user avatar: ", error);
      }
    }
  };

  return (
    <MyImagePicker
      withButton={withButton}
      onChange={updateAvatar}
      defaultUrl={profile?.photoURL}
    />
  );
}
