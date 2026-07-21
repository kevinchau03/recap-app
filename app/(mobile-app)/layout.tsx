import MobileAppShell from "@/components/MobileAppShell";

export default function MobileAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MobileAppShell>{children}</MobileAppShell>;
}
