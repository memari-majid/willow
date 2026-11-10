import { PublicDemo } from "@/components/public-demo";
import { demoCatalog } from "@/lib/public-demo/catalog";
import { SafetyDisclaimer } from "@/components/chat/safety-disclaimer";
export default function DemoPage() { return <><div className="mx-auto mt-6 w-full max-w-4xl px-5"><SafetyDisclaimer /></div><PublicDemo title={demoCatalog.title} subtitle={demoCatalog.subtitle} scope={demoCatalog.scope} examples={demoCatalog.examples.map(({ id, label }) => ({ id, label }))} sources={demoCatalog.sources} /></>; }
