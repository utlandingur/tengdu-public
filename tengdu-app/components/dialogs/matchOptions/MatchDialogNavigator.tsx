import matchOptionsDialogScreen from "components/dialogs/matchOptions/MatchOptionsDialogScreen";
import reportDialogScreen from "components/dialogs/matchOptions/ReportUserDialogScreen";
import unmatchDialogScreen from "components/dialogs/matchOptions/UnmatchDialogScreen";
import ThreeDotsMenu from "components/ThreeDotsMenu";

import createNavigatorComponent from "../../../factoryFunctions/createNavigatorComponent";

const MatchOptionsDialogNavigator = createNavigatorComponent(
  {
    matchOptions: matchOptionsDialogScreen,
    unmatch: unmatchDialogScreen,
    report: reportDialogScreen
  },
  "matchOptions", // initial screen
  ThreeDotsMenu
);

export default MatchOptionsDialogNavigator;
