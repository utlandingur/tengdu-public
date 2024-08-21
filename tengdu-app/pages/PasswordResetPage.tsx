import { DismissKeyboard } from "utils/inputUtils";

import MyPageTitle from "../components/MyPageTitle";
import { MyStack } from "../components/MyStack";
import { PageWrapper } from "../components/PageWrapper";
import PasswordResetForm from "../components/PasswordResetForm";

export default function PasswordResetPage() {
  return (
    <DismissKeyboard>
      <MyStack>
        <PageWrapper>
          <MyPageTitle title={"Reset password"} />
          <PasswordResetForm />
        </PageWrapper>
      </MyStack>
    </DismissKeyboard>
  );
}
