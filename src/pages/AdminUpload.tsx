import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminUpload } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const AdminUpload = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("ADMIN_TOKEN")) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type !== "application/pdf") {
      toast({ title: "Only PDF files are allowed", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setFile(f || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const token = localStorage.getItem("ADMIN_TOKEN");
    if (!token) return navigate("/admin");

    setLoading(true);
    try {
      const result = await adminUpload(token, title, file, slug || undefined, summary || undefined);
      toast({ title: "Upload successful!", description: `Document "${result.slug}" created.` });
      setTitle("");
      setSlug("");
      setSummary("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ADMIN_TOKEN");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
            Beagle
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="custom-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary (optional)</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf">PDF File *</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept="application/pdf"
                  required
                  ref={fileRef}
                  onChange={handleFileChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUpload;
