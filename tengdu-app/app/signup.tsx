import { DismissKeyboard } from "utils/inputUtils";

import MyPageTitle from "../components/MyPageTitle";
import { PageWrapper } from "../components/PageWrapper";
import SignUpForm from "../components/SignUpForm";

export default function Page() {
  return (
    <DismissKeyboard>
      <PageWrapper>
        <MyPageTitle title={"Create an account"} />
        <SignUpForm />
      </PageWrapper>
    </DismissKeyboard>
  );
}
