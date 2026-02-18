import React, { useEffect, useState } from "react";
import { fetchDocuments } from "@/lib/api.js";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { FileText, Search, Loader2, ArrowLeft } from "lucide-react";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadDocuments = async (query) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDocuments(query || undefined);
      setDocuments(Array.isArray(data) ? data : data.documents || []);
    } catch (err) {
      setError(err.message || "Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadDocuments(search);
  };

  const docTypeLabel = (type) => {
    switch (type) {
      case "state_regulation": return "State Regulation";
      case "pms_report_requests": return "PMS Report";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6" data-testid="document-list-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="doc-list-title">
                Documents
              </h1>
              <p className="text-sm text-muted-foreground">
                Browse uploaded regulatory documents
              </p>
            </div>
          </div>
          <Link to="/admin/upload">
            <Button variant="outline" size="sm">Upload New</Button>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="doc-search-input"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" data-testid="doc-search-button">Search</Button>
        </form>

        {loading && (
          <div className="flex items-center justify-center py-12" data-testid="doc-list-loading">
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

        {!loading && !error && documents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground" data-testid="doc-list-empty">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No documents found</p>
          </div>
        )}

        {!loading && documents.length > 0 && (
          <div className="grid gap-3" data-testid="doc-list-grid">
            {documents.map((doc) => (
              <Card key={doc.id || doc.slug} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      {doc.slug ? (
                        <Link
                          to={`/docs/${doc.slug}`}
                          className="hover:text-primary transition-colors"
                          data-testid={`doc-link-${doc.slug}`}
                        >
                          {doc.title}
                        </Link>
                      ) : (
                        doc.title
                      )}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {docTypeLabel(doc.doc_type)}
                    </Badge>
                  </div>
                  {doc.summary && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {doc.summary}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {doc.filename && <span>{doc.filename}</span>}
                    {doc.uploaded_at && (
                      <span>
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
