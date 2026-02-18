import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDocument } from "@/lib/api.js";
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft, Loader2 } from "lucide-react";

const DocumentDetail = () => {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDocument(slug);
        setDoc(data);
      } catch (err) {
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const pdfUrl = doc?.view_url
    ? `https://docs-website-production.up.railway.app${doc.view_url}`
    : doc?.pdf_url;
  const viewerUrl = pdfUrl
    ? `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : null;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="doc-detail-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6" data-testid="doc-detail-error">
        <div className="max-w-3xl mx-auto">
          <Link to="/docs">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="doc-detail-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/docs">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="doc-detail-title">
          {doc?.title}
        </h1>

        {(doc?.updated_at || doc?.uploaded_at) && (
          <p className="text-sm text-muted-foreground mb-6">
            Updated {formatDate(doc.updated_at || doc.uploaded_at)}
          </p>
        )}

        {doc?.summary && (
          <p className="text-muted-foreground mb-6">{doc.summary}</p>
        )}

        {viewerUrl ? (
          <div className="w-full rounded-lg border border-border overflow-hidden" style={{ height: "80vh" }}>
            <iframe
              src={viewerUrl}
              title={doc?.title || "Document viewer"}
              className="w-full h-full"
              style={{ border: "none" }}
              data-testid="doc-pdf-viewer"
            />
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground" data-testid="doc-no-pdf">
            <p>No PDF available for this document.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
