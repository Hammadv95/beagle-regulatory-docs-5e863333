import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import beagleLogo from "@/assets/beagle-logo.png";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDocs, searchDocs, type Doc } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";

const Index = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setLoading(true);
    setError("");

    const load = debouncedQuery.trim() ?
    searchDocs(debouncedQuery).then((r) => r.hits) :
    fetchDocs();

    load.
    then(setDocs).
    catch(() => setError("Failed to load documents.")).
    finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 bg-[#fffaf5]">
          <Link to="/">
            <img src={beagleLogo} alt="Beagle" className="h-16" />
          </Link>
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">

            Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base shadow-sm" />

        </div>

        {error &&
        <p className="text-center text-destructive py-8">{error}</p>
        }

        {loading ?
        <div className="space-y-4">
            {[1, 2, 3].map((i) =>
          <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
          )}
          </div> :
        docs.length === 0 ?
        <p className="text-center text-muted-foreground py-12">
            {query ? "No documents match your search." : "No documents available."}
          </p> :

        <div className="space-y-4">
            {docs.map((doc) =>
          <Link key={doc.slug} to={`/docs/${doc.slug}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {doc.title}
                    </h2>
                    {doc.summary &&
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {doc.summary}
                      </p>
                }
                    <p className="text-xs text-muted-foreground">
                      Updated {format(new Date(doc.updated_at), "MMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
          )}
          </div>
        }
      </main>
    </div>);

};

export default Index;