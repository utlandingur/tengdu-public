import { YStack } from "@tamagui/stacks";
import { useRouter } from "expo-router";

import MyFormNavButtons from "../../../components/MyFormNavButtons";
import MyPageTitle from "../../../components/MyPageTitle";
import { MyStack } from "../../../components/MyStack";
import { PageWrapper } from "../../../components/PageWrapper";
import AvailabilityPage from "../../../pages/ProfileAvailabilityPage";
import { useProfile } from "../../../providers/ProfileProvider";

export default function Page() {
  const { completeProfile } = useProfile();

  const router = useRouter();
  return (
    <MyStack>
      <PageWrapper>
        <MyPageTitle
          title="When are you free to meet others?"
          subtitle={"Used to match you with others who are usually free at the same times."}
        />
        <MyStack>
          <YStack flex={1}>
            <AvailabilityPage />
          </YStack>
        </MyStack>
      </PageWrapper>
      <MyFormNavButtons
        shouldFinish
        onBack={() => {
          router.back();
        }}
        onNext={async () => {
          await completeProfile();
          router.navigate("/");
        }}
      />
    </MyStack>
  );
}
