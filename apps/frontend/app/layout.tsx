import "./globals.css";

export const metadata = {
  title: "HF-Arenas",
  description: "Forecasting and market simulation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
