import { notFound } from "next/navigation";
import ChatApp from "../../components/ChatApp";
import { isBrandId } from "../../lib/brandFace";

export default async function BrandChatPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrandId(brand)) notFound();
  return <ChatApp key={brand} brand={brand} />;
}
