import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

/**
 * The camera and the photo picker both hand back files in the app's cache, which the OS is free
 * to clear. Progress photos need to survive all 90 days, so copy each one into the app's
 * permanent document directory and store that path instead.
 */
export async function persistPhoto(uri: string): Promise<string> {
  if (Platform.OS === "web") return uri;
  try {
    const dir = new Directory(Paths.document, "progress-photos");
    dir.create({ idempotent: true });
    const rawExt = uri.split("?")[0].split(".").pop()?.toLowerCase();
    const ext = rawExt && /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : "jpg";
    const dest = new File(dir, `photo-${Date.now()}.${ext}`);
    await new File(uri).copy(dest);
    return dest.uri;
  } catch {
    // Better to keep the (possibly temporary) original than to lose the photo entirely.
    return uri;
  }
}
