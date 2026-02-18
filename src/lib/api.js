const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

/**
 * Admin upload function to upload documents
 * @param {string} token - Authorization token
 * @param {string} title - Document title
 * @param {File} pdf - PDF file to upload
 * @param {"state_regulation" | "pms_report_requests"} docType - Document type
 * @param {string} [slug] - Optional slug
 * @param {string} [summary] - Optional summary
 * @returns {Promise<any>} Upload response
 */
/**
 * Fetch all documents from the API
 * @param {string} [search] - Optional search query
 * @returns {Promise<any[]>} List of documents
 */
export async function fetchDocuments(search) {
  let url = `${BACKEND_URL}/api/docs`;
  if (search) url += `?q=${encodeURIComponent(search)}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch documents");
  }
  return response.json();
}

export async function adminUpload(
  token,
  title,
  pdf,
  docType,
  slug,
  summary
) {
  const form = new FormData();
  form.append("title", title);
  form.append("pdf", pdf);
  form.append("doc_type", docType);
  
  if (slug) {
    form.append("slug", slug);
  }
  
  if (summary) {
    form.append("summary", summary);
  }

  const response = await fetch(`${BACKEND_URL}/api/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Upload failed");
  }

  return response.json();
}
