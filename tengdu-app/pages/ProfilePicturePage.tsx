import MyFormNavButtons from "components/MyFormNavButtons";
import MyPageTitle from "components/MyPageTitle";
import { MyStack } from "components/MyStack";
import { PageWrapper } from "components/PageWrapper";
import UserAvatarSelector from "components/profile/UserAvatarSelector";
import { router } from "expo-router";
import { useProfile } from "providers/ProfileProvider";
import { Paragraph, YStack } from "tamagui";

const ProfilePicturePage = () => {
  return (
    <MyStack>
      <PageWrapper>
        <MyPageTitle
          title={"Add a profile photo"}
          subtitle={
            "Show us your best smile! \nA great profile picture helps others get to know you better."
          }
        />
        <YStack space={4} />
        <UserAvatarSelector withButton />
      </PageWrapper>
      <MyFormNavButtons
        onBack={() => {
          router.navigate("createProfile/profile");
        }}
        onNext={async () => {
          router.navigate("createProfile/location");
        }}
      />
    </MyStack>
  );
};

export default ProfilePicturePage;
