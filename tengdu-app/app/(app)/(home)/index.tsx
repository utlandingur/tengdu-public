import { useEffect } from "react";
import CentredSpinner from "components/CentredSpinner";
import { useRouter } from "expo-router";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.navigate("/chat");
  }, [router]);

  return <CentredSpinner />;
}
