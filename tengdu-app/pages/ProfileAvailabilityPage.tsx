import { useState, useRef, useCallback } from "react";

import AvailabilityView from "../components/inputs/AvailabilityView";
import { emptyAvailability, weeklyAvailability } from "../models/availability";
import { useProfile } from "../providers/ProfileProvider";
import { useFocusEffect } from '@react-navigation/native';


export default function ProfileAvailabilityPage() {
  const { profile, updateProfile } = useProfile();
  const [availability, setAvailability] = useState<weeklyAvailability>(
    profile?.availability ?? emptyAvailability
  );

  const availabilityRef = useRef(availability);
  availabilityRef.current = availability;

  // updates the profile when the component loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (availabilityRef.current === profile?.availability) return;
        updateProfile({ availability: availabilityRef.current }); 
      };
    }, [updateProfile]));


  return (
    <AvailabilityView
      availability={availability}
      setAvailability={setAvailability}
    />
  );
}
