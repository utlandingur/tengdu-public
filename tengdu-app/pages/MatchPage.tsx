import CentredSpinner from "components/CentredSpinner";
import MatchOptionsDialogNavigator from "components/dialogs/matchOptions/MatchDialogNavigator";
import MatchOverview from "components/MatchOverview";
import { PageWrapper } from "components/PageWrapper";
import { Stack } from "expo-router";
import { useMatchInfo } from "providers/MatchInfoProvider";

const MatchPage = () => {
  const matchInfo = useMatchInfo();
  const { match } = matchInfo || {};

  return !match ? (
    <CentredSpinner size="large" />
  ) : (
    <PageWrapper>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "View match",
          navigationBarHidden: false,
          headerBackTitle: "Back",
          headerRight: () => (
            <MatchOptionsDialogNavigator matchInfo={matchInfo} />
          )
        }}
      />

      <MatchOverview />
    </PageWrapper>
  );
};

export default MatchPage;
