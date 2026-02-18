import { useState } from "react";
import { adminUpload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2 } from "lucide-react";

const AdminUpload = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("state_regulation");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // In a real app, this would come from auth context
  const token = localStorage.getItem("admin_token") || "";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setMessage({ type: "", text: "" });
    } else {
      setFile(null);
      setMessage({ type: "error", text: "Please select a valid PDF file" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }
    
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF file" });
      return;
    }

    if (!token) {
      setMessage({ type: "error", text: "Authentication required. Please log in." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await adminUpload(
        token,
        title,
        file,
        docType,
        slug || undefined,
        summary || undefined
      );
      
      setMessage({ type: "success", text: "Document uploaded successfully!" });
      // Reset form
      setTitle("");
      setSlug("");
      setSummary("");
      setFile(null);
      setDocType("state_regulation");
      // Reset file input
      const fileInput = document.getElementById("pdf-upload");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Upload failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center" data-testid="admin-upload-page">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="admin-upload-title">
            <Upload className="h-5 w-5" />
            Admin Document Upload
          </CardTitle>
          <CardDescription>
            Upload regulatory documents to the system
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                data-testid="upload-title-input"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Slug Input */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                data-testid="upload-slug-input"
                placeholder="Enter URL slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Document Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select
                value={docType}
                onValueChange={(value) => setDocType(value)}
                disabled={loading}
              >
                <SelectTrigger id="doc-type" data-testid="doc-type-select">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state_regulation" data-testid="doc-type-state-regulation">
                    State Regulation (root docs bucket)
                  </SelectItem>
                  <SelectItem value="pms_report_requests" data-testid="doc-type-pms-report">
                    PMS Report Requests (docs/pms_report_requests/)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PDF File Input */}
            <div className="space-y-2">
              <Label htmlFor="pdf-upload">PDF File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pdf-upload"
                  data-testid="upload-file-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
              </div>
              {file && (
                <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid="selected-file-name">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </p>
              )}
            </div>

            {/* Summary Input */}
            <div className="space-y-2">
              <Label htmlFor="summary">Summary (optional)</Label>
              <Textarea
                id="summary"
                data-testid="upload-summary-input"
                placeholder="Enter document summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Status Message */}
            {message.text && (
              <div
                data-testid="upload-message"
                className={`p-3 rounded-md text-sm ${
                  message.type === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-green-500/10 text-green-600"
                }`}
              >
                {message.text}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              data-testid="upload-submit-button"
              className="w-full"
              disabled={loading || !title || !file}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminUpload;
