import { useEffect, useState } from "react";
import { XStack, YStack } from "@tamagui/stacks";
import InputLabel from "components/InputLabel";
import { Label, Text } from "tamagui";

import SelectInput from "./SelectInput";

interface MyFromToSelectProps {
  label: string;
  from: number;
  to: number;
  lowerLimit: number;
  upperLimit: number;
  setFrom: (val: number) => void;
  setTo: (val: number) => void;
}

export default function MyFromToSelect(props: MyFromToSelectProps) {
  const { from, to, setFrom, setTo, lowerLimit, upperLimit, label } = props;

  const initialFromRange = Array.from({ length: to - lowerLimit }, (_, i) => ({
    name: String(i + lowerLimit)
  }));

  // UPDATE TESTS

  const initialToRange = Array.from({ length: upperLimit - from }, (_, i) => ({
    name: String(i + from + 1)
  }));

  const [fromRange, setFromRange] =
    useState<Array<{ name: string }>>(initialFromRange);
  const [toRange, setToRange] =
    useState<Array<{ name: string }>>(initialToRange);

  const onChangeFrom = (newFrom: string) => {
    const fromNum: number = +newFrom;
    const newToRange = Array.from({ length: upperLimit - fromNum }, (_, i) => ({
      name: String(i + fromNum + 1)
    }));
    setToRange(newToRange);
  };

  const onChangeTo = (newTo: string) => {
    const toNum: number = +newTo;
    const newFromRange = Array.from({ length: toNum - lowerLimit }, (_, i) => ({
      name: String(i + lowerLimit)
    }));
    setFromRange(newFromRange);
  };

  return (
    <YStack
      justifyContent="space-between"
      width={"100%"}
    >
      {label && <InputLabel label={label} />}

      <XStack
        gap={"$2"}
        justifyContent="space-between"
        width={"100%"}
        columnGap={"$true"}
        alignContent="center"
      >
        <YStack width={"40%"}>
          <SelectInput
            items={fromRange}
            state={from.toString()}
            setState={(value: string) => setFrom(+value)}
            labelPosition="side"
            onChange={onChangeFrom}
            testID="from"
          />
        </YStack>
        <YStack justifyContent="center">
          <Text fontWeight="bold">to</Text>
        </YStack>
        <YStack width={"40%"}>
          <SelectInput
            items={toRange}
            state={to.toString()}
            setState={(value: string) => setTo(+value)}
            labelPosition="side"
            onChange={onChangeTo}
            testID="to"
          />
        </YStack>
      </XStack>
    </YStack>
  );
}
