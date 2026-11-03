export const BRAND = {
  name: "The Nakashi Furnitures",
  owner: "M. Zubair",
  address: "No. 99, Velachery Main Road, Pallikaranai, Chennai – 600100",
  phone: "9043278618",
  email: "nakashi123@gmail.com",
  upiId: "9043278618@upi",
  upiNumber: "9043278618",
  upiName: "The Nakashi Furnitures",
} as const;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
