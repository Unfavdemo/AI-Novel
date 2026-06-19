import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";

const dmSans = loadDMSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const cormorant = loadCormorant("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

export const fontSans = dmSans.fontFamily;
export const fontSerif = cormorant.fontFamily;
