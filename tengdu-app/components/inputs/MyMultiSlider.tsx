import { useState } from "react";
import { XStack, YStack } from "@tamagui/stacks";
import { Paragraph, Slider, styled } from "tamagui";

const CustomSliderTrack = styled(Slider.Track, {});

export default function MyMultiSlider() {
  const [fromVal, setFromVal] = useState(18);
  const [toVal, setToVal] = useState(50);
  return (
    <YStack space={"$true"}>
      <XStack justifyContent="space-between">
        <Paragraph>Age:</Paragraph>
        <Paragraph>
          {fromVal}-{toVal}
        </Paragraph>
      </XStack>
      <Slider
        size="$2"
        defaultValue={[18, 50]}
        value={[fromVal, toVal]}
        max={99}
        min={18}
        step={1}
        minStepsBetweenThumbs={4}
        onValueChange={(values) => {
          if (values[0] < values[1]) {
            setFromVal(values[0]);
            setToVal(values[1]);
          }
        }}
      >
        <Slider.Thumb
          index={0}
          circular
          zIndex={100}
        />
        <CustomSliderTrack>
          <Slider.TrackActive />
        </CustomSliderTrack>
        <Slider.Thumb
          index={1}
          circular
          zIndex={100}
        />
      </Slider>
    </YStack>
  );
}
