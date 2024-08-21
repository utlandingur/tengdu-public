import { db, firebaseStorage } from "../firebaseConfig";

export async function uploadUserAvatar(
  uri: string,
  uid: string
): Promise<string> {
  const response = await fetch(uri);
  const blob: Blob = await response.blob();
  const metadata = {
    customMetadata: {
      ownerId: uid
    }
  };

  const fileRef = firebaseStorage.ref("avatars/" + uid);

  await fileRef.put(blob, metadata);

  return fileRef.getDownloadURL();
}

export async function loadAvatar(uid: string): Promise<string> {
  if (!uid) {
    return null;
  }
  try {
    const url = await firebaseStorage.ref("avatars/" + uid).getDownloadURL();
    return url;
  } catch (e) {
    return null;
  }
}
