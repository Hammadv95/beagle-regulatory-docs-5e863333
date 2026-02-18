import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import DocDetail from "./pages/DocDetail";
import FAQPage from "./pages/faq.page";
import AdminLogin from "./pages/AdminLogin";
import AdminUpload from "./pages/AdminUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Index />} />
          <Route path="/docs/:slug" element={<DocDetail />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
