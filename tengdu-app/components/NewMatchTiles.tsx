import NewMatchTile from "components/NewMatchTile";
import { useMatches } from "providers/MatchProvider";
import { H4, ScrollView, View } from "tamagui";

const NewMatchList = () => {
  const { hasNewMatches, newMatches } = useMatches();

  if (!hasNewMatches) return null;

  const tilesToDisplay = newMatches.map((match, index) => (
    <NewMatchTile
      key={index}
      match={match}
    />
  ));

  return (
    <View space="$3">
      {hasNewMatches ? <H4>New matches</H4> : null}

      <ScrollView
        horizontal
        flex={"unset"}
        width={"100%"}
        space={16}
        testID="new-match-tiles-scroll"
      >
        {tilesToDisplay}
      </ScrollView>
    </View>
  );
};

export default NewMatchList;
