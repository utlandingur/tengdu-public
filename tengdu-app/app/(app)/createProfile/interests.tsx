import { useRouter } from "expo-router";

import MyFormNavButtons from "../../../components/MyFormNavButtons";
import MyPageTitle from "../../../components/MyPageTitle";
import { MyStack } from "../../../components/MyStack";
import { PageWrapper } from "../../../components/PageWrapper";
import InterestsPage from "../../../pages/InterestsPage";

export default function Page() {
  const router = useRouter();

  return (
    <MyStack>
      <PageWrapper>
        <MyPageTitle
          title="What are you interested in?"
          subtitle="Used to match you with others who like similar things to you."
        />
        <InterestsPage />
      </PageWrapper>
      <MyFormNavButtons
        onBack={() => {
          router.back();
        }}
        onNext={() => {
          router.navigate("createProfile/availability");
        }}
      />
    </MyStack>
  );
}
