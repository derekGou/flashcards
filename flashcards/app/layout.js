export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>AI Flashcards</title>
      </head>
      <body className="min-h-screen bg-gray-100">
        <main>{children}</main>
      </body>
    </html>
  );
}
