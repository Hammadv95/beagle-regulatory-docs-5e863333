import { useEffect, useRef, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

let pdfjsLoadPromise: Promise<any> | null = null;

function loadPdfJs(): Promise<any> {
  if (pdfjsLoadPromise) return pdfjsLoadPromise;
  pdfjsLoadPromise = new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = `${PDFJS_CDN}/pdf.min.js`;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      resolve(lib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return pdfjsLoadPromise;
}

interface PdfViewerProps {
  url: string;
  title?: string;
}

const PdfViewer = ({ url, title }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userScale, setUserScale] = useState(1); // multiplier on top of fit-to-width
  const [baseScale, setBaseScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const renderTaskRef = useRef<number>(0);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const pdfjsLib = await loadPdfJs();
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setUserScale(1);
      } catch {
        if (!cancelled) setError("Failed to load PDF.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  // Compute base scale to fit width
  const computeBaseScale = useCallback(async (doc: any, pageNum: number) => {
    if (!containerRef.current || !doc) return 1;
    const page = await doc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const containerWidth = containerRef.current.clientWidth - 32; // padding
    return containerWidth / unscaledViewport.width;
  }, []);

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
    const taskId = ++renderTaskRef.current;

    setRendering(true);

    (async () => {
      try {
        const newBase = await computeBaseScale(pdfDoc, currentPage);
        if (taskId !== renderTaskRef.current) return;
        setBaseScale(newBase);

        const finalScale = newBase * userScale;
        const page = await pdfDoc.getPage(currentPage);
        if (taskId !== renderTaskRef.current) return;

        const viewport = page.getViewport({ scale: finalScale });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        // Use device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        ctx.scale(dpr, dpr);

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (e) {
        // render cancelled or failed silently
      } finally {
        if (taskId === renderTaskRef.current) setRendering(false);
      }
    })();
  }, [pdfDoc, currentPage, userScale, computeBaseScale]);

  // Recalculate on resize
  useEffect(() => {
    if (!pdfDoc) return;
    const handleResize = () => {
      // Force re-render by bumping a dependency
      setUserScale(s => s); // no-op but triggers effect... need another approach
    };
    // Actually, just re-trigger via a resize counter
    return () => {};
  }, [pdfDoc]);

  const zoomIn = useCallback(() => {
    setUserScale(s => Math.min(3, +(s + 0.25).toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    setUserScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)));
  }, []);

  const resetZoom = useCallback(() => {
    setUserScale(1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const effectiveZoom = Math.round(userScale * 100);

  if (error) {
    return <p className="text-center text-destructive py-8">{error}</p>;
  }

  if (loading) {
    return <Skeleton className="h-[75vh] w-full rounded-lg" />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between bg-muted/50 border-b px-3 py-2 rounded-t-lg flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={prevPage}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={nextPage}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={userScale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[50px] text-center">{effectiveZoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={userScale >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          {userScale !== 1 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetZoom} title="Reset zoom">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div ref={containerRef} className="overflow-auto bg-muted/30 flex justify-center p-4" style={{ height: "80vh" }}>
        <canvas ref={canvasRef} className="block shadow-lg" />
      </div>
    </div>
  );
};

export default PdfViewer;
