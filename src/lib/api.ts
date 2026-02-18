const API_BASE = "https://docs-website-production.up.railway.app";

export interface Doc {
  slug: string;
  title: string;
  summary: string;
  updated_at: string;
  is_published?: boolean;
  view_url?: string;
}

export interface SearchResult {
  query: string;
  hits: Doc[];
  estimatedTotalHits: number;
}

export async function fetchDocs(docType?: string): Promise<Doc[]> {
  const url = docType ? `${API_BASE}/api/docs?doc_type=${encodeURIComponent(docType)}` : `${API_BASE}/api/docs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch docs");
  const data = await res.json();
  return data.docs;
}

export async function fetchDoc(slug: string): Promise<Doc> {
  const res = await fetch(`${API_BASE}/api/docs/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch doc");
  return res.json();
}

export async function searchDocs(query: string): Promise<SearchResult> {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function getViewUrl(slug: string): string {
  return `${API_BASE}/api/docs/${slug}/view`;
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const body = new URLSearchParams({ email, password });
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  return data.token;
}

export async function adminUpload(
  token: string,
  title: string,
  pdf: File,
  slug?: string,
  summary?: string
): Promise<{ slug: string; url: string }> {
  const form = new FormData();
  form.append("title", title);
  form.append("pdf", pdf);
  if (slug) form.append("slug", slug);
  if (summary) form.append("summary", summary);

  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
