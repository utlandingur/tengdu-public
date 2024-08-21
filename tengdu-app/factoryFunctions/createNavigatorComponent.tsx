import React, { useReducer } from "react";
import DialogInstance from "components/DialogInstance";
import { SheetProps } from "tamagui";

// Used by createNavigatorComponent
export interface DialogInfo {
  title: string;
  description: string;
  // optional
  titleHidden?: boolean;
  descriptionHidden?: boolean;
  snapPoints?: SheetProps["snapPoints"];
  snapPointsMode?: SheetProps["snapPointsMode"];
  noScrollableBody?: boolean;
  footerInBody?: boolean;
  footerCancelButtonText?: string;
  customFooter?: boolean;
}

export interface DialogScreen {
  dialogInfo: DialogInfo;
  body: (props: any) => JSX.Element;
  footer: (props: any) => JSX.Element;
}

interface screen {
  [key: string]: DialogScreen;
}

// Factory function to create a navigator component
const createNavigatorComponent = (
  screens: screen,
  initialScreen: string,
  trigger: React.ComponentType<any>
) => {
  const Navigator = (props) => {
    const [screenState, dispatch] = useReducer((state, action) => {
      switch (action.type) {
        case "navigate":
          return screens[action.screen];
        default:
          return state;
      }
    }, screens[initialScreen]);

    const navigate = (screen) => () => {
      dispatch({ type: "navigate", screen });
    };

    const ScreenBody = screenState.body;
    const ScreenFooter = screenState.footer;

    return (
      <DialogInstance
        trigger={trigger}
        title={screenState.dialogInfo.title}
        description={screenState.dialogInfo.description}
        titleHidden={screenState.dialogInfo.titleHidden}
        descriptionHidden={screenState.dialogInfo.descriptionHidden}
        body={
          <ScreenBody
            navigate={navigate}
            {...props}
          />
        }
        noScrollableBody={screenState.dialogInfo.noScrollableBody}
        snapPoints={screenState.dialogInfo.snapPoints}
        snapPointsMode={screenState.dialogInfo.snapPointsMode}
        footerInBody={screenState.dialogInfo.footerInBody}
        footerCancelButtonText={screenState.dialogInfo.footerCancelButtonText}
        customFooter={
          screenState.dialogInfo.customFooter ? (
            <ScreenFooter
              navigate={navigate}
              {...props}
            />
          ) : null
        }
      />
    );
  };

  return Navigator;
};

export default createNavigatorComponent;
