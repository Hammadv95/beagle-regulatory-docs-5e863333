import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DocumentList from "./pages/DocumentList.jsx";
import DocumentDetail from "./pages/DocumentDetail.jsx";
import axios from "axios";
import { Button } from "./components/ui/button.jsx";
import { Input } from "./components/ui/input.jsx";
import { Label } from "./components/ui/label.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select.jsx";
import { Textarea } from "./components/ui/textarea.jsx";
import { Upload, FileText, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://docs-website-production.up.railway.app";
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div>
      <header className="App-header">
        <a
          className="App-link"
          href="https://beagleprotected.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" alt="Beagle Logo" />
        </a>
        <p className="mt-5">Building something incredible ~!</p>
        <Link 
          to="/docs" 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          data-testid="docs-link"
        >
          View Documents
        </Link>
        <Link 
          to="/admin/upload" 
          className="mt-3 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          data-testid="admin-upload-link"
        >
          Admin Upload
        </Link>
      </header>
    </div>
  );
};

const AdminUpload = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("state_regulation");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
    if (!title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    if (!file) { setMessage({ type: "error", text: "Please select a PDF file" }); return; }
    if (!token) { setMessage({ type: "error", text: "Authentication required. Please log in." }); return; }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("pdf", file);
      form.append("doc_type", docType);
      if (slug) form.append("slug", slug);
      if (summary) form.append("summary", summary);

      const response = await fetch(`${BACKEND_URL}/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
      }

      setMessage({ type: "success", text: "Document uploaded successfully!" });
      setTitle(""); setSlug(""); setSummary(""); setFile(null); setDocType("state_regulation");
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
          <CardDescription>Upload regulatory documents to the system</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" data-testid="upload-title-input" placeholder="Enter document title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" data-testid="upload-slug-input" placeholder="Enter URL slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select value={docType} onValueChange={(value) => setDocType(value)} disabled={loading}>
                <SelectTrigger id="doc-type" data-testid="doc-type-select">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state_regulation" data-testid="doc-type-state-regulation">State Regulation (root docs bucket)</SelectItem>
                  <SelectItem value="pms_report_requests" data-testid="doc-type-pms-report">PMS Report Requests (docs/pms_report_requests/)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf-upload">PDF File *</Label>
              <Input id="pdf-upload" data-testid="upload-file-input" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} disabled={loading} className="cursor-pointer" />
              {file && (
                <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid="selected-file-name">
                  <FileText className="h-4 w-4" />{file.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary (optional)</Label>
              <Textarea id="summary" data-testid="upload-summary-input" placeholder="Enter document summary" value={summary} onChange={(e) => setSummary(e.target.value)} disabled={loading} rows={3} />
            </div>
            {message.text && (
              <div data-testid="upload-message" className={`p-3 rounded-md text-sm ${message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"}`}>
                {message.text}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" data-testid="upload-submit-button" className="w-full" disabled={loading || !title || !file}>
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>) : (<><Upload className="h-4 w-4" />Upload Document</>)}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<DocumentList />} />
          <Route path="/docs/:slug" element={<DocumentDetail />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
