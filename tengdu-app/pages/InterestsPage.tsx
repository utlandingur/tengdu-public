import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { XStack, YStack } from "@tamagui/stacks";
import CentredSpinner from "components/CentredSpinner";
import ItemList from "components/ItemList";
import MyChip from "components/MyChip";
import { getInterests } from "db/interests";
import { Interests } from "models/interests";
import { useProfile } from "providers/ProfileProvider";
import { Input, Paragraph } from "tamagui";
import { useFocusEffect } from "@react-navigation/native";

let interests: Interests = [];

export default function InterestsPage() {
  const { profile, updateProfile } = useProfile();

  const [search, setSearch] = useState("");
  const [showInterests, setShowInterests] = useState<Interests>([]);
  const [selectedInterests, setSelectedInterests] = useState(
    profile?.interests ?? []
  );
  const [loading, setLoading] = useState(true);

  const selectedInterestsRef = useRef(selectedInterests);
  selectedInterestsRef.current = selectedInterests; // Always keep ref updated

  useEffect(() => {
    const fetchInterests = async () => {
      const tmp = await getInterests();
      if (tmp) {
        interests = tmp;
        setShowInterests(tmp);
      }
    };
    void fetchInterests();
    setLoading(false);
  }, []);

  useMemo(() => {
    setShowInterests(
      interests.filter(
        (value) =>
          value.name.toLowerCase().includes(search.toLowerCase()) ||
          value.alts
            ?.map((val) => val.toLowerCase())
            .some((val) => val.includes(search.toLowerCase()))
      )
    );
  }, [search]);

  // updates the profile when the component loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (selectedInterestsRef.current !== profile.interests) {
          updateProfile({ interests: selectedInterestsRef.current });
        }
      };
    }, [updateProfile])
  );

  if (loading) {
    return (
      <CentredSpinner
        size="large"
        flex={1}
      />
    );
  }

  return (
    <YStack
      gap={"$true"}
      flex={1}
    >
      <Input
        placeholder="Search"
        onChangeText={(newText) => setSearch(newText)}
        borderWidth={2}
      />
      <XStack
        minHeight={48}
        alignItems="center"
        gap={"$true"}
      >
        <FlatList
          data={selectedInterests}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          renderItem={({ item }) => (
            <MyChip
              text={item}
              deletable={true}
              pressable={true}
              onPress={() => {
                setSelectedInterests(
                  selectedInterests.filter((interest) => interest != item)
                );
              }}
              testId="selected-chip"
            />
          )}
        />
        <Paragraph
          size={"$6"}
          fontWeight={"bold"}
          color={selectedInterests.length === 10 ? "red" : "$black"}
          marginBottom={"$2"}
          testID="selected-interest-count"
        >
          {selectedInterests.length}/10
        </Paragraph>
      </XStack>
      <ItemList
        items={showInterests.map((interest) => interest.name)}
        highlightedItems={selectedInterests}
        setHighlightedItems={setSelectedInterests}
      />
    </YStack>
  );
}
