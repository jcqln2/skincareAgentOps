import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "../../components/ui";
import { BRAND_FACE, BRAND_IDS, isBrandId } from "../../lib/brandFace";

export function generateStaticParams() {
  return BRAND_IDS.map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  if (!isBrandId(brand)) return {};
  const face = BRAND_FACE[brand];
  return { title: `${face.wordmark} · skincare agentops`, description: face.blurb };
}

export default async function BrandLayout({ children, params }: { children: React.ReactNode; params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrandId(brand)) notFound();
  const face = BRAND_FACE[brand];
  return (
    <div className={face.pageClass}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${brand}`} className={`flex items-center gap-2 ${face.wordmarkClass}`}>
          <Avatar brand={brand} size={36} /> {face.wordmark}
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/" className="rounded-full px-3 py-1.5 text-black/60 hover:text-black">all brands</Link>
          <Link href={`/${brand}`} className={face.navChatClass}>chat</Link>
          <Link href={`/${brand}/ops`} className={face.navOpsClass}>agent dashboard</Link>
        </nav>
      </header>
      {children}
      <footer className="py-6 text-center text-xs opacity-60">{face.disclaimer}</footer>
    </div>
  );
}
