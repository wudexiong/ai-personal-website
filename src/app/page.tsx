import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">AI个人网站</h1>
      <div className="flex gap-4">
        <Link
          href="/admin/articles"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          文章管理
        </Link>
      </div>
    </main>
  );
} 