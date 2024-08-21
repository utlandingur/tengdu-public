import React from "react";
import MyButton from "components/inputs/MyButton";
import {
  Adapt,
  Dialog,
  ScrollView,
  Sheet,
  VisuallyHidden,
  XStack,
  YStack
} from "tamagui";
import { SheetProps } from "tamagui";

export interface DialogProps {
  // required
  title: string;
  description: string;
  trigger: React.ComponentType; // triggers the dialog
  body: React.ReactNode;

  // optional
  titleHidden?: boolean; //default to false
  descriptionHidden?: boolean; //default to false
  noScrollableBody?: boolean;
  animationType?: "bouncy" | "lazy" | "quick" | null;
  justifyBodyContent?: // on the Y-axis
  | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";

  // to customise space taken up by the modal
  // @see https://tamagui.dev/ui/sheet/1.59.0
  snapPointsMode?: SheetProps["snapPointsMode"];
  snapPoints?: SheetProps["snapPoints"];

  // Default is just cancel button which closes the dialog
  customFooter?: React.ReactNode;
  footerCancelButtonText?: string;
  footerInBody?: boolean;
}

// To allow for a consistent, easy to use and tested dialog component
export default function DialogInstance({
  title,
  titleHidden,
  description,
  descriptionHidden,
  trigger: MenuButton,
  body,
  animationType,
  footerCancelButtonText,
  customFooter,
  footerInBody,
  noScrollableBody,
  snapPointsMode,
  snapPoints,
  justifyBodyContent
}: DialogProps) {
  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        <MenuButton />
      </Dialog.Trigger>

      <Adapt
        when="sm"
        platform="native"
      >
        <Sheet
          animation={animationType}
          zIndex={200000}
          modal
          disableDrag
          dismissOnSnapToBottom
          snapPoints={snapPoints}
          snapPointsMode={snapPointsMode}
          native
          moveOnKeyboardChange
          //   unmountChildrenWhenHidden
        >
          <Sheet.Frame
            paddingHorizontal="$4"
            paddingTop="$4"
            // paddingBottom="$6"
            gap="$4"
            testID="dialog-sheet-frame"
            style={{ backgroundColor: "white" }} // Add this line
          >
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation={animationType}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            testID="dialog-sheet-overlay"
            opacity={0.5}
            style={{ backgroundColor: "black" }} // Add this line
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation={animationType}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          testID="dialog-overlay"
        />

        <Dialog.Content
          testID="dialog-content"
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            animationType,
            {
              opacity: {
                overshootClamping: true
              }
            }
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
        >
          {footerInBody ? (
            <DialogBody
              title={title}
              titleHidden={titleHidden}
              description={description}
              descriptionHidden={descriptionHidden}
              body={body}
              scrollableBody={!noScrollableBody}
              footer={
                <DialogFooter
                  cancelButtonText={footerCancelButtonText}
                  customFooter={customFooter}
                />
              }
            />
          ) : (
            <DialogBody
              title={title}
              titleHidden={titleHidden}
              description={description}
              descriptionHidden={descriptionHidden}
              body={body}
              scrollableBody={!noScrollableBody}
              justifyBodyContent={justifyBodyContent}
            />
          )}
          {!footerInBody && (
            <DialogFooter
              cancelButtonText={footerCancelButtonText}
              customFooter={customFooter}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

interface DialogTitleProps {
  title: string;
  titleHidden?: boolean;
}

const DialogTitle = ({ title, titleHidden }: DialogTitleProps) => {
  if (!titleHidden) {
    return <Dialog.Title>{title}</Dialog.Title>;
  }
  return (
    <VisuallyHidden>
      <Dialog.Title>{title}</Dialog.Title>
    </VisuallyHidden>
  );
};

interface DialogDescriptionProps {
  description: string;
  descriptionHidden?: boolean;
}

const DialogDescription = ({
  description,
  descriptionHidden
}: DialogDescriptionProps) => {
  if (!descriptionHidden) {
    return <Dialog.Description>{description}</Dialog.Description>;
  }
  return (
    <VisuallyHidden>
      <Dialog.Description>{description}</Dialog.Description>
    </VisuallyHidden>
  );
};

interface DialogBodyProps {
  title: string;
  titleHidden?: boolean;
  description: string;
  descriptionHidden?: boolean;
  body: React.ReactNode;
  footer?: JSX.Element;
  scrollableBody: boolean;
  justifyBodyContent?: // on the Y-axis
  | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
}

const DialogBody = ({
  title,
  titleHidden,
  description,
  descriptionHidden,
  body: BodyComponent,
  footer,
  scrollableBody,
  justifyBodyContent
}: DialogBodyProps) => {
  return scrollableBody ? (
    <ScrollView
      space={"$true"}
      testID="scrollable-body-view"
      maxHeight={"100%"}
      contentContainerStyle={{
        justifyContent: justifyBodyContent
      }}
    >
      <DialogTitle
        title={title}
        titleHidden={titleHidden}
      />
      <DialogDescription
        description={description}
        descriptionHidden={descriptionHidden}
      />
      {BodyComponent}
      {footer}
    </ScrollView>
  ) : (
    <YStack
      testID="non-scrollable-body-view"
      space={"$true"}
      height={"100%"}
      flex={1}
      justifyContent={justifyBodyContent}
    >
      <DialogTitle
        title={title}
        titleHidden={titleHidden}
      />
      <DialogDescription
        description={description}
        descriptionHidden={descriptionHidden}
      />
      {BodyComponent}
      {footer}
    </YStack>
  );
};

interface DialogFooterProps {
  customFooter?: React.ReactNode;
  cancelButtonText?: string; // default to "Close"
}

// Standardised approach to dialog footers
// This can be ignored if the dialog does not require a footer
// can be overridden if a custom footer is required by placing it in the body component
const DialogFooter = ({
  customFooter: CustomFooter,
  cancelButtonText
}: DialogFooterProps) => {
  if (CustomFooter) {
    return <>{CustomFooter}</>;
  }
  return (
    <XStack
      justifyContent={"center"}
      paddingVertical="$true"
      paddingHorizontal="$true"
      testID="dialog-footer"
    >
      <Dialog.Close
        displayWhenAdapted
        asChild
      >
        <MyButton
          type="tertiary"
          aria-label={cancelButtonText ?? "Close"}
          text={cancelButtonText ?? "Close"}
          noBorder
          testID="dialog-close-button"
          alignSelf="center"
        />
      </Dialog.Close>
    </XStack>
  );
};
