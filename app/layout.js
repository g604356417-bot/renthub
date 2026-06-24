import "./globals.css";

export const metadata = {
  title: "RentHub",
  description: "Multi-vendor rental marketplace front-end built with Next.js.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
