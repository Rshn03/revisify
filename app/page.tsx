"use client";
export default function Home() {
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">
        Revisify
      </h1>
    </main>
  );
}