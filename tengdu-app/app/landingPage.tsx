import { Redirect } from "expo-router";
import LandingPage from "pages/LandingPage";

import { useSession } from "../providers/AuthProvider";

export default function Home() {
  const { user } = useSession();

  if (user) {
    return <Redirect href="/" />;
  }

  return <LandingPage />;
}
