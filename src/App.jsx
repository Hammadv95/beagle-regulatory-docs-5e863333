import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DocumentList from "./pages/DocumentList.jsx";
import DocumentDetail from "./pages/DocumentDetail.jsx";
import PMSReportList from "./pages/PMSReportList.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="flex flex-col items-center mb-12">
        <img
          src="https://beagleprotected.com/assets/beagle-logo-CcCLgaIr.png"
          alt="Beagle"
          className="h-36 mb-4"
        />
      </div>
      <div className="w-full max-w-md space-y-4">
        <Link to="/docs" data-testid="docs-link">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow cursor-pointer group border-border/60">
            <div className="p-6 flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  State Regulatory Policies
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse and search state-level regulatory policy documents.
                </p>
              </div>
            </div>
          </div>
        </Link>
        <Link to="/docs/pms-reports" data-testid="pms-reports-link">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow cursor-pointer group border-border/60">
            <div className="p-6 flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Risk Report Requests
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  View PMS report request documents.
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

const AdminUpload = () => {
  // Admin upload component
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("state_regulation");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const token = localStorage.getItem("admin_token") || "";

  // Redirect to login if no token
  if (!token) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <p className="mb-4 text-muted-foreground">You need to log in to access the admin panel.</p>
          <a href="/admin/login">
            <Button>Go to Login</Button>
          </a>
        </Card>
      </div>
    );
  }

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
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<DocumentList />} />
          <Route path="/docs/pms-reports" element={<PMSReportList />} />
          <Route path="/docs/:slug" element={<DocumentDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
