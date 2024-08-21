import { fireEvent, waitFor } from "@testing-library/react-native";
import { View } from "tamagui";

import ItemList from "../../../components/ItemList";
import { render } from "../../../render";

const highlightedColor = "#fff";

describe("ItemList", () => {
  const mockItems: string[] = ["Activity 1", "Activity 2", "Activity 3"];

  it("renders correctly", () => {
    const { getAllByTestId } = render(<ItemList items={mockItems} />, {});
    expect(getAllByTestId("chip").length).toBe(3);
  });

  it("allows selection of items", () => {
    const setHighlightedItems = jest.fn();
    const { getByText } = render(
      <ItemList
        items={mockItems}
        highlightedItems={["Activity 2"]}
        setHighlightedItems={setHighlightedItems}
      />,
      {}
    );

    fireEvent.press(getByText("Activity 1"));
    expect(setHighlightedItems).toHaveBeenCalledWith([
      "Activity 2",
      "Activity 1"
    ]);
  });
  // TODO - fix this test
  it("does not allow selection of more than 10 items", () => {
    const setHighlightedItems = jest.fn();
    const { getByText } = render(
      <ItemList
        items={mockItems}
        highlightedItems={new Array(10).fill("Activity")}
        setHighlightedItems={setHighlightedItems}
      />,
      {}
    );

    fireEvent.press(getByText("Activity 1"));
    expect(setHighlightedItems).not.toHaveBeenCalled();
  });

  it("removes activity from highlighted items when selected again", () => {
    const setHighlightedItems = jest.fn();
    const { getByText } = render(
      <ItemList
        items={mockItems}
        highlightedItems={["Activity 1"]}
        setHighlightedItems={setHighlightedItems}
      />,
      {}
    );

    fireEvent.press(getByText("Activity 1"));
    expect(setHighlightedItems).toHaveBeenCalledWith([]);
  });

  it("does not add activity to highlighted items when there are already 10", () => {
    const setHighlightedItems = jest.fn();
    const { getByText } = render(
      <ItemList
        items={mockItems}
        highlightedItems={new Array(10).fill("Activity")}
        setHighlightedItems={setHighlightedItems}
      />,
      {}
    );

    fireEvent.press(getByText("Activity 1"));
    expect(setHighlightedItems).not.toHaveBeenCalledWith(
      expect.arrayContaining(["Activity 1"])
    );
  });
  it("renders correctly with no items", () => {
    const { queryByTestId } = render(<ItemList items={[]} />, {});
    expect(queryByTestId("chip")).toBeNull();
  });
  it("initially highlights items", () => {
    const { getByText } = render(
      <ItemList
        items={mockItems}
        highlightedItems={["Activity 1"]}
      />,
      {}
    );
    // Replace 'chip-selected' with the test ID of your highlighted chips
    expect(getByText("Activity 1").props.style.color).toBe(highlightedColor);
    expect(getByText("Activity 2").props.style.color).not.toBe(
      highlightedColor
    );
    expect(getByText("Activity 3").props.style.color).not.toBe(
      highlightedColor
    );
  });
  it("does not allow selection of items when setHighlightedItems is not defined", async () => {
    const { getByText } = render(<ItemList items={mockItems} />, {});

    fireEvent.press(getByText("Activity 1"));
    await waitFor(() =>
      expect(getByText("Activity 1").props.style.color).toBe(highlightedColor)
    );
  });
  it("highlights all items when setHighlightedItems is not defined", async () => {
    const { getByText } = render(<ItemList items={mockItems} />, {});

    await waitFor(() => {
      expect(getByText("Activity 1").props.style.color).toBe(highlightedColor);
      expect(getByText("Activity 2").props.style.color).toBe(highlightedColor);
      expect(getByText("Activity 3").props.style.color).toBe(highlightedColor);
    });
  });
  it("renders custom chip component", () => {
    interface CustomChipProps {
      text: string;
    }

    const CustomChip: React.FC<CustomChipProps> = ({
      text
    }: CustomChipProps) => {
      return <View testID="custom-chip">{text}</View>;
    };

    const { getAllByTestId, debug } = render(
      <ItemList
        items={mockItems}
        customChip={CustomChip}
      />,
      {}
    );
    expect(getAllByTestId("custom-chip").length).toBe(3);
  });
});
