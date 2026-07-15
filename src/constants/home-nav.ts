export type HomeNavId = "home" | "wheelchair" | "device" | "history" | "profile";

export const homeNavItems: Array<{
  id: HomeNavId;
  href: string;
  icon: string;
  label: string;
}> = [
  { id: "home", href: "/home", icon: "home", label: "Home" },
  { id: "wheelchair", href: "/home/booking", icon: "handyman", label: "Booking" },
  { id: "device", href: "/home/device", icon: "device_hub", label: "My Device" },
  { id: "history", href: "/home/history", icon: "schedule", label: "History" },
  { id: "profile", href: "/home/profile", icon: "person", label: "Profile" },
];
