import { useEffect, useState } from "react";
import { Check } from "@tamagui/lucide-icons";
import { XStack, YStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import CentredSpinner from "components/CentredSpinner";
import { styled, ThemeableStack } from "tamagui";

import {
  DailyPeriods,
  dailyPeriodsArray,
  weeklyAvailability,
  weeklyAvailabilityArray
} from "../../models/availability";

interface myAvailabilityInputProps {
  availability: weeklyAvailability;
  // view only if not set
  setAvailability?: (availability: weeklyAvailability) => void;
}

const periods = Object.values(DailyPeriods).filter((key) => isNaN(Number(key)));

export default function AvailabilityView({
  availability,
  setAvailability
}: myAvailabilityInputProps) {
  if (!availability) {
    return null;
  }
  const [isLoading, setIsLoading] = useState(true);

  const AvailabilityItem = styled(ThemeableStack, {
    pressTheme: setAvailability ? true : false,
    focusTheme: setAvailability ? true : false,
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

  const availabilityMap = weeklyAvailabilityArray.map((weekday, index) => {
    // ensures the order is correct
    const periods = availability[weekday];
    return (
      <XStack
        key={"weekday-" + index}
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
          {dailyPeriodsArray.map((period, index) => {
            // ensures the order is correct
            const value = periods[period];
            const handleOnPress = () => {
              toggleAvailability(weekday, period);
            };

            if (value) {
              return (
                <AvailabilityItemChecked
                  onPress={setAvailability ? handleOnPress : null}
                  key={"period-" + index}
                  backgroundColor="$primaryBackground"
                  testID={`availability-item-checked-${weekday}-${period}`}
                  borderColor={"transparent"}
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
                onPress={setAvailability ? handleOnPress : null}
                key={"period-" + index}
                testID={`availability-item-${weekday}-${period}`}
              />
            );
          })}
        </XStack>
      </XStack>
    );
  });

  if (isLoading) {
    return (
      <CentredSpinner
        size="large"
        flex={1}
      />
    );
  }

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
      {availabilityMap}
    </YStack>
  );
}
