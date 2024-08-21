import SignInForm from "components/SignInForm";
import { DismissKeyboard } from "utils/inputUtils";

import MyPageTitle from "../components/MyPageTitle";
import { PageWrapper } from "../components/PageWrapper";

export default function Page() {
  return (
    <DismissKeyboard>
      <PageWrapper>
        <MyPageTitle title={"Sign in with email"} />
        <SignInForm />
      </PageWrapper>
    </DismissKeyboard>
  );
}
