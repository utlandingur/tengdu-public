import { useCallback, useEffect, useRef, useState } from "react";
import { useProfile } from "providers/ProfileProvider";
import { useFocusEffect } from "@react-navigation/native";

import MyFromToSelect from "./MyFromToSelect";

const AgeFromToSelect = () => {
  const { profile, updateProfile } = useProfile();

  const [ageFrom, setAgeFrom] = useState(profile?.matching?.ageFrom ?? 18);
  const [ageTo, setAgeTo] = useState(profile?.matching?.ageTo ?? 99);

  const ageFromRef = useRef(ageFrom);
  ageFromRef.current = ageFrom;

  const ageToRef = useRef(ageTo);
  ageToRef.current = ageTo;

  // updates the profile when the component loses focus
  useFocusEffect(
    useCallback(() => {
      // Component has gained focus
      return () => {
        if (
          ageFromRef.current === profile?.matching?.ageFrom &&
          ageToRef.current === profile?.matching?.ageTo
        )
          return;
        updateProfile({
          matching: { ageFrom: ageFromRef.current, ageTo: ageToRef.current }
        });
      };
    }, [updateProfile])
  );

  if (!profile) {
    return null;
  }

  return (
    <MyFromToSelect
      label="Age"
      lowerLimit={18}
      upperLimit={99}
      from={ageFrom}
      setFrom={setAgeFrom}
      to={ageTo}
      setTo={setAgeTo}
    />
  );
};

export default AgeFromToSelect;
