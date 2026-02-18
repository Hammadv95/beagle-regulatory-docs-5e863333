import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ArrowLeft, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import beagleLogo from "@/assets/beagle-logo.png";

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

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 bg-[#fffaf5]">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/">
              <img src={beagleLogo} alt="Beagle" className="h-16" />
            </Link>
          </div>
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6 text-primary">Frequently Asked Questions</h1>
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
                <Collapsible key={cat} defaultOpen={cat === "General" || cat === "Portfolio Fit"} className="mb-8">
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-xl font-semibold border-b pb-2 cursor-pointer hover:text-primary transition-colors">
                    {cat}
                    <ChevronDown className="h-5 w-5 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <Accordion type="single" collapsible>
                      {items.map(faq => (
                        <AccordionItem key={faq.id} value={faq.id} className="bg-card rounded-lg border mb-2 px-4">
                          <AccordionTrigger className="text-left hover:text-primary">{faq.question}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
}
