import { deleteMatchDocument } from "../src/utils/firestore/matches";

export const clearMatches = async (matchIds: string[]) => {
  for (const matchId of matchIds) {
    await deleteMatchDocument(matchId);
  }
};
