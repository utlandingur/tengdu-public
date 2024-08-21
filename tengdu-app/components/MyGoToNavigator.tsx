import { ArrowRightCircle } from "@tamagui/lucide-icons";
import { ThemeableStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { useRouter } from "expo-router";
import { styled } from "tamagui";

interface MyGoToNavigatorProps {
  title: string;
  route: string;
  currentValue?: string;
}

export default function MyGoToNavigator(props: MyGoToNavigatorProps) {
  const router = useRouter();

  return (
    <PressableStack
      justifyContent="space-between"
      hoverTheme={true}
      pressTheme={true}
      focusTheme={true}
      onPress={() => {
        router.navigate(props.route);
      }}
    >
      <Paragraph>{props.title}</Paragraph>
      <XStack space="$2">
        <Paragraph>{props.currentValue ?? "Edit"}</Paragraph>
        <ArrowRightCircle />
      </XStack>
    </PressableStack>
  );
}

const PressableStack = styled(ThemeableStack, {
  hoverTheme: true,
  pressTheme: true,
  focusTheme: true,
  padding: "$true",
  space: "$2",
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: "$background"
});
