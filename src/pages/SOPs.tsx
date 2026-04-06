import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import beagleLogo from "@/assets/beagle-logo.png";
import { Search, ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDocs, searchDocs, type Doc } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";

const SOPs = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setLoading(true);
    setError("");

    const load = debouncedQuery.trim()
      ? searchDocs(debouncedQuery).then((r) => r.hits.filter((d) => d.doc_type === "sop"))
      : fetchDocs("sop");

    load
      .then(setDocs)
      .catch(() => setError("Failed to load SOPs."))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 bg-[hsl(30,100%,98%)]">
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
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Standard Operating Procedures
          </h1>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SOPs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base shadow-sm"
          />
        </div>

        {error && (
          <p className="text-center text-destructive py-8">{error}</p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-3" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {query ? "No SOPs match your search." : "No SOPs available."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => (
              <Link key={doc.slug} to={`/docs/${doc.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-border/60 h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {doc.title}
                      </h2>
                    </div>

                    {doc.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                        {doc.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(doc.updated_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      {doc.version && (
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          v{doc.version}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SOPs;
