import { BRAND } from "./brand";

/** Edit this to change the announcement bar message. Set `message` to "" to hide it. */
export const ANNOUNCEMENT = {
  message: "Visit our showroom on Velachery Main Road, Pallikaranai",
  linkLabel: "Get directions",
  linkTo: "/contact" as const,
};

export const BRAND_DESCRIPTION =
  "Thoughtfully designed furniture for comfortable, elegant homes — from our showroom in Pallikaranai, Chennai.";

export const WHATSAPP_URL = `https://wa.me/91${BRAND.phone}?text=${encodeURIComponent(
  "Hello Nakashi Furnitures, I'd like to know more about your furniture.",
)}`;

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
] as const;
