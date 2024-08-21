// TODO - Turn this into a form component or split into different screens
// Also try to see if we improve the validation logic so that it isn't always relying on the submit button to validate
// As it doesn't align with how we have split up other pages / components

import { Timestamp } from "@firebase/firestore";
import { YStack } from "@tamagui/stacks";
import CentredSpinner from "components/CentredSpinner";
import { useRouter } from "expo-router";
import { useInputField } from "hooks/useInputField";

import MyDateTimePicker from "../components/inputs/MyDateTimePicker";
import SelectInput from "../components/inputs/SelectInput";
import TextInput from "../components/inputs/TextInput";
import MyFormNavButtons from "../components/MyFormNavButtons";
import MyPageTitle from "../components/MyPageTitle";
import { PageWrapper } from "../components/PageWrapper";
import { genderItems } from "../models/user";
import { useSession } from "../providers/AuthProvider";
import { useProfile } from "../providers/ProfileProvider";
import { verifyAge } from "../utils/verificationUtils";

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const { signOut } = useSession();
  const router = useRouter();

  const firstName = useInputField({
    initialValue: profile?.firstName ?? "",
    errorMessage: "Missing first name"
  });

  const lastName = useInputField({
    initialValue: profile?.lastName ?? "",
    errorMessage: "Missing last name"
  });

  const dateOfBirth = useInputField({
    initialValue: profile?.dateOfBirth
      ? new Date(profile.dateOfBirth.seconds * 1000)
      : new Date(),
    errorMessage: "You must be 18 to use Tengdu"
  });

  const gender = useInputField({
    initialValue: profile?.gender ?? undefined,
    errorMessage: "Please select"
  });

  // Validate the form on and set errors if necessary
  const validate = () => {
    let valid = true;

    // Name checks
    if (!firstName.val) {
      firstName.setErr(true);
      valid = false;
    }
    if (!lastName.val?.length) {
      lastName.setErr(true);
      valid = false;
    }
    // DateOfBirth checks
    if (!dateOfBirth.val) {
      dateOfBirth.setErr(true);
      valid = false;
    }
    if (!verifyAge(dateOfBirth.val)) {
      dateOfBirth.setErr(true);
      valid = false;
    }

    if (gender.val === undefined) {
      gender.setErr(true);
      valid = false;
    }
    return valid;
  };

  return profile ? (
    <PageWrapper justifyContent="space-between">
      <YStack>
        <MyPageTitle title={"Create your profile"} />
        <YStack
          gap={"$true"}
          paddingHorizontal={"$1"}
        >
          <TextInput
            label="First Name"
            state={firstName.val}
            setState={firstName.setVal}
            error={firstName.err}
            errorMessage={firstName.errorMessage}
            setError={firstName.setErr}
            autoCapitalize="words"
          />
          <TextInput
            label="Last Name"
            state={lastName.val}
            setState={lastName.setVal}
            error={lastName.err}
            errorMessage={lastName.errorMessage}
            setError={lastName.setErr}
            autoCapitalize="words"
          />

          <YStack gap={"$true"}>
            <YStack gap={"$true"}>
              <YStack paddingHorizontal={"$1"}>
                <MyDateTimePicker
                  label="Date of Birth"
                  type={"date"}
                  state={dateOfBirth.val}
                  setState={dateOfBirth.setVal}
                  error={dateOfBirth.err}
                  errorMessage={dateOfBirth.errorMessage}
                  setError={dateOfBirth.setErr}
                  testID="Date"
                />
              </YStack>
              <YStack
                paddingHorizontal={"$1"}
                gap={"$true"}
              >
                <SelectInput
                  label="Gender"
                  items={genderItems}
                  testID="Gender"
                  state={gender.val}
                  setState={gender.setVal}
                  error={gender.err}
                  setError={gender.setErr}
                  errorMessage={gender.errorMessage}
                />
              </YStack>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
      <MyFormNavButtons
        onBack={() => {
          signOut();
        }}
        onNext={async () => {
          if (validate()) {
            await updateProfile({
              firstName: firstName.val,
              lastName: lastName.val,
              dateOfBirth: Timestamp.fromDate(new Date(dateOfBirth.val)),
              gender: gender.val,
            });
            router.navigate("createProfile/profilePicture");
          }
        }}
      />
    </PageWrapper>
  ) : (
    <CentredSpinner />
  );
}
