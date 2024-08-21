import { useRouter } from "expo-router";

import MyFormNavButtons from "../../../components/MyFormNavButtons";
import MyPageTitle from "../../../components/MyPageTitle";
import { PageWrapper } from "../../../components/PageWrapper";
import LocationPage from "../../../pages/LocationPage";

export default function Page() {
  const router = useRouter();
  return (
    <PageWrapper justifyContent="space-between">
      <MyPageTitle
        title="Where you live"
        subtitle="Used to match you with others who live nearby."
      ></MyPageTitle>
      <LocationPage />
      <MyFormNavButtons
        onBack={() => {
          router.back();
        }}
        onNext={() => {
          router.navigate("createProfile/interests");
        }}
      />
    </PageWrapper>
  );
}
