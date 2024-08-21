import { useEffect, useState } from "react";
import { Check } from "@tamagui/lucide-icons";
import { XStack, YStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { styled, ThemeableStack } from "tamagui";

import { DailyPeriods, weeklyAvailability } from "../models/availability";

interface myAvailabilityInputProps {
  availability: weeklyAvailability;
  setAvailability?: (availability: weeklyAvailability) => void;
}

const periods = Object.values(DailyPeriods).filter((key) => isNaN(Number(key)));

export default function MyAvailabilityInput({
  availability,
  setAvailability
}: myAvailabilityInputProps) {
  const [isLoading, setIsLoading] = useState(true);

  const toggleAvailability = (weekday: string, period: string) => {
    const tmp_availability = {
      ...availability
    };
    tmp_availability[weekday][period] = !availability[weekday][period];
    setAvailability(tmp_availability);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const availabilityMap = Object.entries(availability).map(
    ([weekday, periods], index) => {
      return (
        <XStack
          key={"weekday-" + index}
          flex={1}
          flexWrap="nowrap"
          gap={"$2"}
          height={45}
        >
          <XStack
            width={40}
            justifyContent="center"
            alignItems="center"
          >
            <Paragraph fontWeight={"bold"}>
              {weekday.charAt(0).toUpperCase() + weekday.slice(1, 3)}
            </Paragraph>
          </XStack>
          <XStack
            flex={1}
            gap="$2"
            borderColor="red"
          >
            {Object.entries(periods).map(([period, value], index) => {
              const handleOnPress = () => {
                toggleAvailability(weekday, period);
              };

              if (value) {
                return (
                  <AvailabilityItemChecked
                    onPress={setAvailability ? handleOnPress : undefined}
                    key={"period-" + index}
                    backgroundColor="$secondaryBackground"
                    testID={`availability-item-checked-${weekday}-${period}`}
                  >
                    <Check
                      size="$2"
                      color="#FFFFFF"
                    />
                  </AvailabilityItemChecked>
                );
              }
              return (
                <AvailabilityItem
                  onPress={() => {
                    toggleAvailability(weekday, period);
                  }}
                  key={"period-" + index}
                  testID={`availability-item-${weekday}-${period}`}
                />
              );
            })}
          </XStack>
        </XStack>
      );
    }
  );

  return (
    <YStack
      gap={"$2"}
      flex={1}
      maxHeight={400}
    >
      <XStack
        flex={1}
        gap={"$2"}
        justifyContent="space-around"
        alignItems="stretch"
        alignContent="space-around"
      >
        <XStack width={40}></XStack>
        {periods.map((period) => (
          <XStack
            justifyContent="center"
            alignContent="center"
            alignItems="center"
            flex={1}
            key={period}
          >
            <Paragraph fontWeight={"bold"}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Paragraph>
          </XStack>
        ))}
      </XStack>
      {/* TODO {isLoading && (SOME LOADING SPINNER GOES HERE) */}
      {!isLoading && availabilityMap}
    </YStack>
  );
}
const AvailabilityItem = styled(ThemeableStack, {
  hoverTheme: true,
  pressTheme: true,
  focusTheme: true,
  bordered: true,
  flex: 1,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  width: 15
});

const AvailabilityItemChecked = styled(AvailabilityItem, {
  backgroundColor: "$background",
  hoverTheme: false
});
