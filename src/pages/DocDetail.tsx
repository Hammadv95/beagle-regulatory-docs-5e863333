import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import beagleLogo from "@/assets/beagle-logo.png";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDoc, getViewUrl, type Doc } from "@/lib/api";
import { format } from "date-fns";

const DocDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchDoc(slug)
      .then(setDoc)
      .catch(() => setError("Failed to load document."))
      .finally(() => setLoading(false));
  }, [slug]);

  const viewUrl = slug ? getViewUrl(slug) : "";
  const googleViewerUrl = viewUrl
    ? `https://docs.google.com/gview?url=${encodeURIComponent(viewUrl)}&embedded=true`
    : "";

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4 bg-[#fffaf5]">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/">
            <img src={beagleLogo} alt="Beagle" className="h-14" />
          </Link>
          <span className="text-lg font-semibold text-foreground truncate ml-auto">
            {doc?.title ?? "Document"}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {error && <p className="text-center text-destructive py-8">{error}</p>}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[70vh] w-full rounded-lg" />
          </div>
        ) : doc ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">{doc.title}</h1>
              {doc.summary && (
                <p className="text-muted-foreground mb-2">{doc.summary}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Updated {format(new Date(doc.updated_at), "MMM d, yyyy")}
              </p>
            </div>
            <div className="rounded-lg border overflow-hidden shadow-sm bg-card">
              <iframe
                src={googleViewerUrl}
                title={doc.title}
                className="w-full h-[75vh]"
              />
              {/* Overlay to cover the Google Docs Viewer external link icon */}
              
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default DocDetail;
