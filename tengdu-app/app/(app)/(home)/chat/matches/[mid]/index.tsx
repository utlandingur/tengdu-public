import { useEffect, useState } from "react";
import CentredSpinner from "components/CentredSpinner";
import { useLocalSearchParams, useRouter } from "expo-router";
import MatchPage from "pages/MatchPage";
import { MatchInfoProvider } from "providers/MatchInfoProvider";

export default function Page() {
  const { mid } = useLocalSearchParams();
  const [loading, setLoading] = useState(!mid);
  const router = useRouter();

  useEffect(() => {
    if (mid && typeof mid === "string") {
      setLoading(false);
    }
  }, [mid]);

  if (loading) {
    return <CentredSpinner size="large" />;
  }

  if (mid && typeof mid === "string") {
    return (
      <MatchInfoProvider matchId={mid}>
        <MatchPage />
      </MatchInfoProvider>
    );
  } else {
    router.back();
  }
}
