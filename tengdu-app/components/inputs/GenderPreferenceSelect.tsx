import { useCallback, useRef, useState } from "react";

import { matchingPreferences } from "../../models/user";
import { useProfile } from "../../providers/ProfileProvider";
import { useFocusEffect } from "@react-navigation/native";

import SelectInput from "./SelectInput";

const GenderPreferenceSelect = () => {
  const { profile, updateProfile } = useProfile();

  const [gender, setGender] = useState(profile?.matching?.gender ?? "Anyone");

  const genderRef = useRef(gender);
  genderRef.current = gender;

  // updates the profile when the component loses focus
  useFocusEffect(
    useCallback(() => {
      // Component has gained focus
      return () => {
        if (genderRef.current === profile?.matching?.gender) return;
        updateProfile({ matching: { gender: genderRef.current } });
      };
    }, [updateProfile])
  );

  if (!profile) {
    return null;
  }

  return (
    <SelectInput
      label="Gender"
      items={matchingPreferences}
      testID="gender"
      state={gender}
      setState={setGender}
    />
  );
};

export default GenderPreferenceSelect;
