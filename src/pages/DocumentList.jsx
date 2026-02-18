import React, { useEffect, useState, useMemo } from "react";
import { fetchDocuments } from "@/lib/api.js";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input.jsx";
import { Search, Loader2 } from "lucide-react";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDocuments();
        setDocuments(Array.isArray(data) ? data : data.docs || data.documents || []);
      } catch (err) {
        setError(err.message || "Failed to load documents");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title?.toLowerCase().includes(q) ||
        doc.summary?.toLowerCase().includes(q) ||
        doc.slug?.toLowerCase().includes(q)
    );
  }, [documents, search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="document-list-page">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1
          className="text-3xl md:text-4xl font-bold text-primary mb-6"
          data-testid="doc-list-title"
        >
          State Regulatory Policies
        </h1>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="doc-search-input"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16" data-testid="doc-list-loading">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div
            data-testid="doc-list-error"
            className="p-4 rounded-md bg-destructive/10 text-destructive text-sm"
          >
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground" data-testid="doc-list-empty">
            <p>No documents found</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-0" data-testid="doc-list-grid">
            {filtered.map((doc) => {
              const date = formatDate(doc.uploaded_at || doc.updated_at);
              const slug = doc.slug;

              const content = (
                <div className="px-5 py-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer">
                  <h2 className="text-base font-semibold text-foreground">
                    {doc.title}
                  </h2>
                  {date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Updated {date}
                    </p>
                  )}
                </div>
              );

              return slug ? (
                <Link
                  key={doc.id || slug}
                  to={`/docs/${slug}`}
                  className="block mb-2"
                  data-testid={`doc-link-${slug}`}
                >
                  {content}
                </Link>
              ) : (
                <div key={doc.id} className="mb-2">
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
