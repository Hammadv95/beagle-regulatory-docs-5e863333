import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, FileText, Loader2, HelpCircle } from "lucide-react";

const API_BASE = "https://docs-website-production.up.railway.app";

export default function AdminUploadPage() {
  const [docType, setDocType] = useState<string>("state_regulation");
  
  // Document upload state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  // FAQ state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: "", text: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setMessage({ type: "", text: "" });
    } else {
      setFile(null);
      setMessage({ type: "error", text: "Please select a valid PDF file" });
    }
  };

  const handleDocumentUpload = async () => {
    if (!title.trim()) throw new Error("Title is required");
    if (!file) throw new Error("Please select a PDF file");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pdf", file);
    formData.append("doc_type", docType);
    if (slug) formData.append("slug", slug);
    if (summary) formData.append("summary", summary);

    const response = await fetch(`${API_BASE}/admin/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Upload failed");
    }
    return response.json();
  };

  const handleFAQSubmit = async () => {
    if (!question.trim() || !answer.trim()) throw new Error("Question and Answer are required");

    const formData = new FormData();
    formData.append("question", question);
    formData.append("answer", answer);
    if (category) formData.append("category", category);
    formData.append("display_order", displayOrder.toString());

    const response = await fetch(`${API_BASE}/admin/faqs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "FAQ creation failed");
    }
    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: "error", text: "Please log in first" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (docType === "faq") {
        await handleFAQSubmit();
        setMessage({ type: "success", text: "FAQ created successfully!" });
        setQuestion(""); setAnswer(""); setCategory(""); setDisplayOrder(0);
      } else {
        await handleDocumentUpload();
        setMessage({ type: "success", text: "Document uploaded successfully!" });
        setTitle(""); setSlug(""); setSummary(""); setFile(null);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Operation failed" });
    } finally {
      setLoading(false);
    }
  };

  const isFAQ = docType === "faq";

  return (
    <div className="min-h-screen bg-[#fffaf4] p-6 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isFAQ ? <HelpCircle className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            Admin Upload
          </CardTitle>
          <CardDescription>
            {isFAQ ? "Add a new FAQ entry" : "Upload regulatory documents"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="state_regulation">State Regulatory Policy</SelectItem>
                  <SelectItem value="pms_report_requests">PMS Request Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isFAQ ? (
              <>
                <div className="space-y-2">
                  <Label>Question *</Label>
                  <Input value={question} onChange={(e) => setQuestion(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label>Answer *</Label>
                  <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={loading} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Category (optional)</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label>PDF File *</Label>
                  <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={loading} />
                  {file && <p className="text-sm text-gray-500 flex items-center gap-1"><FileText className="h-4 w-4" />{file.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Summary (optional)</Label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} disabled={loading} rows={3} />
                </div>
              </>
            )}

            {message.text && (
              <div className={`p-3 rounded-md text-sm ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {message.text}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full bg-[#ff7900] hover:bg-[#e66d00]" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isFAQ ? "Create FAQ" : "Upload Document"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
