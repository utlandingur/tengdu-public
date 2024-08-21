import { YStack } from "@tamagui/stacks";

import AgeFromToSelect from "../components/inputs/AgeFromToSelect";
import GenderPreferenceSelect from "../components/inputs/GenderPreferenceSelect";

export default function MatchingPage() {
  return (
    <YStack gap={"$true"}>
      <GenderPreferenceSelect />
      <AgeFromToSelect />
    </YStack>
  );
}
