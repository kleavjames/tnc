import localFont from "next/font/local";

export const montserrat = localFont({
  src: [
    { path: "./Montserrat-Thin.ttf", weight: "100", style: "normal" },
    { path: "./Montserrat-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "./Montserrat-Light.ttf", weight: "300", style: "normal" },
    { path: "./Montserrat-Regular.ttf", weight: "400", style: "normal" },
    { path: "./Montserrat-Medium.ttf", weight: "500", style: "normal" },
    { path: "./Montserrat-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./Montserrat-Bold.ttf", weight: "700", style: "normal" },
    { path: "./Montserrat-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./Montserrat-Black.ttf", weight: "900", style: "normal" },
    { path: "./Montserrat-ThinItalic.ttf", weight: "100", style: "italic" },
    {
      path: "./Montserrat-ExtraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
    { path: "./Montserrat-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "./Montserrat-Italic.ttf", weight: "400", style: "italic" },
    { path: "./Montserrat-MediumItalic.ttf", weight: "500", style: "italic" },
    {
      path: "./Montserrat-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    { path: "./Montserrat-BoldItalic.ttf", weight: "700", style: "italic" },
    {
      path: "./Montserrat-ExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    { path: "./Montserrat-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});
