import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const API_BASE = "https://docs-website-production.up.railway.app";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/faqs`)
      .then(res => res.json())
      .then(data => setFaqs(data.faqs || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return faqs;
    const q = query.toLowerCase();
    return faqs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [faqs, query]);

  const grouped = filtered.reduce((acc, faq) => {
    const cat = faq.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (loading) return <div className="min-h-screen bg-[#fffaf4] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#ff7900]" /></div>;

  return (
    <div className="min-h-screen bg-[#fffaf4]">
      <div className="bg-[#ff7900] px-4 py-10 mb-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-white/80 hover:text-white hover:underline inline-flex items-center gap-1 mb-3">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-white">Frequently Asked Questions</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base shadow-sm"
          />
        </div>
        
        {Object.keys(grouped).length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No FAQs match your search.</p>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">{cat}</h2>
              <Accordion type="single" collapsible>
                {items.map(faq => (
                  <AccordionItem key={faq.id} value={faq.id} className="bg-white rounded-lg border mb-2 px-4">
                    <AccordionTrigger className="text-left hover:text-[#ff7900]">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </div>
    </div>
  );
}