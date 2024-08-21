import React from "react";
import { H2, Paragraph, YStack } from "tamagui";

interface MyPageTitleProps {
  title: string;
  subtitle?: string;
}

export default function MyPageTitle(props: MyPageTitleProps) {
  const { title, subtitle } = props;

  return (
    <YStack>
      <H2
        fontWeight="900"
        paddingBottom="$true"
        testID={`${title}-title`}
      >
        {title}
      </H2>
      {subtitle && <Paragraph>{subtitle}</Paragraph>}
    </YStack>
  );
}
