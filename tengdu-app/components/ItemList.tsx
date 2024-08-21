import { XStack } from "@tamagui/stacks";
import { ScrollView } from "tamagui";

import MyChip, { myChipProps } from "./MyChip";

interface ItemListProps {
  items: string[];
  highlightedItems?: string[];
  setHighlightedItems?: (activities: string[] | string[]) => void;
  testId?: string;
  customChip?: React.ComponentType<myChipProps>;
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
}

// TODO - allow this to also be a list of strings, flatList etc

export default function ItemList({
  items,
  highlightedItems,
  setHighlightedItems,
  testId,
  customChip,
  justifyContent = "flex-start"
}: ItemListProps) {
  const Chip = customChip || MyChip; // defaults to MyChip if no customChip is provided
  if (!items) {
    return null;
  }
  return (
    <ScrollView
      gap={"$2"}
      testID={`${testId}-items-scrollview`}
    >
      <XStack
        flexWrap={"wrap"}
        gap={"$1.5"}
        justifyContent={justifyContent}
      >
        {items.map((item, index) => (
          // if no itemComponent is provided, use MyChip
          <Chip
            key={index}
            testId="chip"
            text={item}
            pressable={Boolean(setHighlightedItems)}
            selected={highlightedItems ? highlightedItems.includes(item) : true}
            // If setSelectedActivities is defined, then the user can select activities
            // otherwise the component is read-only
            onPress={
              setHighlightedItems && highlightedItems
                ? () => {
                    if (highlightedItems.includes(item)) {
                      const tmp = [...highlightedItems];
                      setHighlightedItems(tmp.filter((act) => act != item));
                      // Can only select up to 10 activities
                      // If needed in future, make this dependent on a new prop
                    } else if (highlightedItems.length < 10) {
                      setHighlightedItems([...highlightedItems, item]);
                    }
                  }
                : null
            }
          />
        ))}
      </XStack>
    </ScrollView>
  );
}
