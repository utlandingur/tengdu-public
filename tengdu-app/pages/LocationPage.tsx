import { useCallback, useRef, useState } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Paragraph, XStack, YStack } from "tamagui/";

import { colors } from "../GLOBAL_VALUES";
import { useProfile } from "../providers/ProfileProvider";
import { useFocusEffect } from '@react-navigation/native';

export default function LocationPage() {
  const { updateProfile, profile } = useProfile();
  const [location, setLocation] = useState(profile?.location ?? undefined);

  const locationRef = useRef(location);
  locationRef.current = location; // Always keep ref updated

  const [isFocused, setIsFocused] = useState(false);

  // updates the profile when the component loses focus
  useFocusEffect(
    useCallback(() => {
      // Component has gained focus
      return () => {
        if (locationRef.current === profile?.location) return;
        updateProfile({ location: locationRef.current }); 
      };
    }, [updateProfile]));


  return (
    <YStack
      gap={"$true"}
      flex={1}
    >
      <XStack
        gap={"$true"}
        flexWrap="wrap"
      >
        <Paragraph fontWeight={"800"}>Your location:</Paragraph>
        <Paragraph>{location?.description ?? "-"}</Paragraph>
      </XStack>

      <GooglePlacesAutocomplete
        placeholder="Search"
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          setLocation(data)
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
          language: "en",
          // only allows cities or localities to be displayed and selected
          type: "(cities)"
        }}
        requestUrl={{
          useOnPlatform: "web", // or "all"
          url: "https://proxyrequest-pncz7dpt5a-uc.a.run.app?text=https://maps.googleapis.com/maps/api"
        }}
        styles={{
          textInput: {
            backgroundColor: colors.white,
            borderWidth: 1,
            borderRadius: 9,
            fontSize: 12,
            fontFamily: "Nunito-sans",
            borderStyle: "solid",
            color: colors.black,
            borderColor: isFocused ? colors.green : colors.black
          },
          predefinedPlacesDescription: {
            color: "red"
          },
          separator: {
            height: 1,
            backgroundColor: colors.green
          }
        }}
        textInputProps={{
          onFocus: () => setIsFocused(true),
          onBlur: () => {
            setIsFocused(false);
          }
        }}
        // currentLocation={true}
        // currentLocationLabel="Current location"
      />
    </YStack>
  );
}
