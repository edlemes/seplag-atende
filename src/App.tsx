import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Cadastro from "./pages/Cadastro";
import Solicitacao from "./pages/Solicitacao";
import Confirmacao from "./pages/Confirmacao";
import Admin from "./pages/Admin";
import Avaliacao from "./pages/Avaliacao";
import Faq from "./pages/Faq";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/solicitacao" element={<Solicitacao />} />
            <Route path="/confirmacao" element={<Confirmacao />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/avaliacao" element={<Avaliacao />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
