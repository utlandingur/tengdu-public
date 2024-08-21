import React, { useRef } from "react";
import { Check, ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import InputLabel from "components/InputLabel";
import { Adapt, Select, Sheet, YStack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

export interface SelectItem {
  name: string;
}

// T allows us to keep strict typing on the state, as defined in the parent
// e.g. "Male" | "Female" | "Other
interface SelectProps<T extends string> {
  items: SelectItem[];
  label?: string;
  labelPosition?: "top" | "side";
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>> | ((value: T) => void);
  error?: boolean;
  setError?: (value: boolean) => void;
  errorMessage?: string;
  testID?: string;
  onChange?: (value: string) => void;
}

export default function SelectInput<T extends string>(props: SelectProps<T>) {
  const {
    items,
    label,
    labelPosition,
    state,
    setState,
    error,
    setError,
    errorMessage,
    testID,
    onChange
  } = props;

  return (
    <YStack>
      {label && (
        <InputLabel
          label={label}
          error={error}
          errorMessage={errorMessage}
          testID={testID}
        />
      )}

      <Select
        id="select"
        onValueChange={(newState) => {
          onChange && onChange(newState);
          setError && setError(false);
          setState(newState as T);
        }}
        value={state?.toLocaleLowerCase() as T}
      >
        <Select.Trigger
          id="select"
          iconAfter={ChevronDown}
          testID={testID ? `${testID}-select-trigger` : undefined}
          borderColor={error ? "red" : undefined}
        >
          <Select.Value />
        </Select.Trigger>

        <Adapt
          when="sm"
          platform="touch"
        >
          <Sheet
            modal
            dismissOnSnapToBottom
          >
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.ScrollUpButton
            ai="center"
            jc="center"
            pos="relative"
            w="100%"
            h="$3"
          >
            <YStack zi={10}>
              <ChevronUp size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={["$background", "$backgroundTransparent"]}
              br="$4"
            />
          </Select.ScrollUpButton>

          <Select.Viewport minWidth={200}>
            <Select.Group>
              <Select.Label color="$green">{label}</Select.Label>
              {items.map((item, i) => {
                return (
                  <Select.Item
                    index={i}
                    key={item.name}
                    value={item.name.toLowerCase()}
                    testID={testID ? `${testID}-select-item` : undefined}
                  >
                    <Select.ItemText
                      color="$color"
                      fontWeight={"normal"}
                    >
                      {item.name}
                    </Select.ItemText>
                    <Select.ItemIndicator ml="auto">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton
            ai="center"
            jc="center"
            pos="relative"
            w="100%"
            h="$3"
          >
            <YStack zi={10}>
              <ChevronDown size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={["$backgroundTransparent", "$background"]}
              br="$4"
            />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select>
    </YStack>
  );
}
