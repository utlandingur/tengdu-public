import MyGoToNavigator from "components/MyGoToNavigator";
import { PageWrapper } from "components/PageWrapper";
import UserAvatarSelector from "components/profile/UserAvatarSelector";
import { useSession } from "providers/AuthProvider";
import { useProfile } from "providers/ProfileProvider";
import { H3, XStack, YGroup, YStack } from "tamagui";

import MyButton from "../components/inputs/MyButton";

export default function ProfileOverview() {
  const { profile } = useProfile();
  const { signOut } = useSession();

  return (
    <PageWrapper
      justifyContent="flex-start"
      flex={1}
    >
      <YStack
        justifyContent="space-between"
        flex={1}
        gap={"$true"}
        paddingBottom="$true"
      >
        <YStack
          gap="$true"
          flex={1}
          justifyContent="flex-start"
        >
          <XStack
            // width={"100%"}
            justifyContent="space-between"
            flexDirection="row"
          >
            <H3 alignSelf="center">
              {profile.firstName} {profile.lastName}
            </H3>
            <UserAvatarSelector />
          </XStack>
          <YStack alignSelf="stretch">
            <YGroup
              borderRadius="$radius.true"
              bordered
              overflow="hidden"
            >
              <YGroup.Item>
                <MyGoToNavigator
                  title="Location"
                  route="profile/editLocation"
                  currentValue={profile?.location?.description}
                />
                <MyGoToNavigator
                  title="Interests"
                  route="profile/editInterests"
                />
                <MyGoToNavigator
                  title="Availability"
                  route="profile/editAvailability"
                />
                <MyGoToNavigator
                  title="Preferences"
                  route="profile/editPreferences"
                />
              </YGroup.Item>
            </YGroup>
          </YStack>
        </YStack>
        <YStack
          alignSelf="stretch"
          paddingBottom="$true"
        >
          <MyButton
            rounded
            type="danger"
            onPress={signOut}
            theme="red"
            noBorder
          >
            Sign out
          </MyButton>
        </YStack>
      </YStack>
    </PageWrapper>
  );
}
