// useChatFilters.ts
import { useMemo } from "react";
import { useSession } from "providers/AuthProvider";

// filters out chatIds that are passed in and returns a filter object for use in the ChannelList component
export const useChatFilters = (chatIds) => {
  const { user } = useSession();

  if (!user) {
    return null;
  }

  return useMemo(() => {
    const filters: {
      members: { $in: string[] };
      type: string;
      id?: { $nin: string[] };
    } = {
      members: { $in: [user.uid] },
      type: "messaging"
    };

    if (chatIds.length > 0) {
      const idsToFilter = chatIds
        .filter(Boolean)
        .filter((val) => typeof val === "string");
      filters.id = { $nin: idsToFilter };
    }

    return filters;
  }, [user, chatIds]);
};
