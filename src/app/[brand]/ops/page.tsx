import { notFound } from "next/navigation";
import OpsDashboard from "../../../components/OpsDashboard";
import { isBrandId } from "../../../lib/brandFace";

export default async function BrandOpsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrandId(brand)) notFound();
  return <OpsDashboard brand={brand} />;
}
