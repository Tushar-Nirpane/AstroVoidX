import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, Loader2, Search, Bot, Code, LineChart, MessageSquare, Menu, PanelLeftClose, Image as ImageIcon, Download, Layout, Home } from "lucide-react";
import { toast } from "sonner";

const AI_AGENTS = [
  { id: 5, name: "HomePage", icon: Home },
  { id: 1, name: "Code Assistant", icon: Code },
  { id: 2, name: "Design Agent", icon: Sparkles },
  { id: 3, name: "Slide Architect", icon: Layout },
  { id: 4, name: "Data Analyzer", icon: LineChart },
];

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeAgent, setActiveAgent] = useState<number | null>(5);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState("");

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generationError, setGenerationError] = useState("");

  // PPT Generation State
  const [pptPrompt, setPptPrompt] = useState("");
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const [pptResult, setPptResult] = useState<any>(null);
  const [pptError, setPptError] = useState("");

  // Data Analyzer State
  const [analysisData, setAnalysisData] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // if (!s) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true);
      // if (!session) navigate("/auth", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResults(null);

    try {
      const response = await fetch('http://localhost:3002/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
      setSearchError("Failed to perform search. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError("");
    setGeneratedImageUrl("");

    try {
      const response = await fetch('http://localhost:3002/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePpt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pptPrompt.trim()) return;

    setIsGeneratingPpt(true);
    setPptError("");
    setPptResult(null);

    try {
      const response = await fetch('http://localhost:3002/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pptPrompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate presentation');
      }

      setPptResult(data);
      toast.success("Presentation structure generated successfully!");
    } catch (err: any) {
      console.error(err);
      setPptError(err.message);
    } finally {
      setIsGeneratingPpt(false);
    }
  };

  const handleAnalyzeData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisData.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult("");

    try {
      const response = await fetch('http://localhost:3002/api/analyze-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: analysisData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze data');
      }

      const data = await response.json();
      setAnalysisResult(data.summary);
      toast.success("Analysis complete");
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Failed to analyze data. Please try again later.");
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-hero">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-hero">
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl animate-float-slow" />
      
      {/* Sidebar Container */}
      <aside 
        className={`glass-morphism relative z-20 flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
          isSidebarOpen ? "w-72 opacity-100" : "w-0 border-r-0 opacity-0"
        }`}
      >
        <div className="flex w-72 flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <button onClick={() => setActiveAgent(5)} className="flex items-center gap-3 text-left">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold tracking-tight text-lg">AstroVoidX</span>
            </button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(false)} 
              className="rounded-xl text-muted-foreground hover:bg-white/20 hover:text-foreground -mr-2 transition-colors"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                Integrated Agents
              </h3>
              <div className="space-y-1">
                {AI_AGENTS.map((agent) => {
                  const Icon = agent.icon;
                  const isActive = activeAgent === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setActiveAgent(agent.id)}
                      className={`glass-btn w-full gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-white/30 text-foreground shadow-glow border-white/40" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {agent.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              onClick={handleSignOut} 
              className="w-full justify-start rounded-xl text-muted-foreground hover:bg-white/20 hover:text-foreground transition-all"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-24 px-6 overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        
        {/* Toggle Button for when sidebar is closed */}
        <div 
          className={`absolute top-6 left-6 z-30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isSidebarOpen ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
          }`}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl bg-white/10 hover:bg-white/20 text-foreground backdrop-blur border border-white/20 shadow-soft"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {activeAgent === 2 ? (
          // Design Agent View
          <section className="w-full max-w-3xl text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur mb-6 shadow-glow">
              <Sparkles className="h-4 w-4 text-primary" /> Design Agent (DALL-E 3)
            </div>
            <h1 className="text-4xl font-semibold tracking-tight mb-4">
              Imagine anything. We'll generate it.
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground mb-12">
              Describe the image you want to see. The more detailed your prompt, the better the result.
            </p>

            <div className="glass overflow-hidden rounded-3xl border border-white/20 p-6 shadow-elegant text-left">
              <form onSubmit={handleGenerateImage} className="space-y-4">
                <div>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A futuristic cyber-city floating in the clouds, digital art, highly detailed..."
                    className="w-full min-h-[120px] resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isGenerating}
                    className="glass-btn rounded-xl px-8 shadow-glow bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Image"}
                  </Button>
                </div>
              </form>

              {generationError && (
                <div className="mt-6 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl animate-fade-in">
                  {generationError}
                </div>
              )}

              {generatedImageUrl && (
                <div className="mt-8 space-y-4 animate-fade-in">
                  <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-square">
                    <img src={generatedImageUrl} alt={imagePrompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <a href={generatedImageUrl} download="generated-image.png" target="_blank" rel="noreferrer">
                        <Button variant="secondary" className="rounded-full shadow-glow">
                          <Download className="mr-2 h-4 w-4" /> Download High-Res
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : activeAgent === 3 ? (
          // Slide Architect View
          <section className="w-full max-w-3xl text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur mb-6 shadow-glow">
              <Layout className="h-4 w-4 text-primary" /> Slide Architect (Canva Connect)
            </div>
            <h1 className="text-4xl font-semibold tracking-tight mb-4">
              AI-Powered Presentation Builder
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground mb-12">
              Provide a topic or outline, and we'll scaffold a presentation in Canva for you.
            </p>

            <div className="glass overflow-hidden rounded-3xl border border-white/20 p-6 shadow-elegant text-left">
              <form onSubmit={handleGeneratePpt} className="space-y-4">
                <div>
                  <textarea
                    value={pptPrompt}
                    onChange={(e) => setPptPrompt(e.target.value)}
                    placeholder="E.g., Quarterly business review for a tech startup focusing on AI integration..."
                    className="w-full min-h-[120px] resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isGeneratingPpt}
                    className="glass-btn rounded-xl px-8 shadow-glow bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isGeneratingPpt ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Architecting...</> : "Generate Presentation"}
                  </Button>
                </div>
              </form>

              {pptError && (
                <div className="mt-6 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl animate-fade-in flex flex-col gap-2">
                  <span className="font-semibold">Configuration Required</span>
                  <p>{pptError}</p>
                </div>
              )}

              {pptResult && (
                <div className="mt-8 space-y-6 animate-fade-in">
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Layout className="h-4 w-4 text-primary" /> Slide Structure Generated
                      </h3>
                      <a href={pptResult.url} target="_blank" rel="noreferrer">
                        <Button variant="secondary" size="sm" className="rounded-xl">
                          Open in Canva
                        </Button>
                      </a>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {pptResult.structure.map((slide: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5">
                          <div className="text-xs font-bold text-primary mb-1 uppercase tracking-widest">Slide {idx + 1}</div>
                          <div className="font-medium text-foreground">{slide.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">{slide.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : activeAgent === 4 ? (
          // Data Analyzer View
          <section className="w-full max-w-4xl text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur mb-6 shadow-glow">
              <LineChart className="h-4 w-4 text-primary" /> Data Analyzer (Gemini AI)
            </div>
            <h1 className="text-4xl font-semibold tracking-tight mb-4">
              Advanced Data Insights
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground mb-12">
              Paste your raw data, CSV content, or text logs below to get an AI-powered summary and insights.
            </p>

            <div className="glass overflow-hidden rounded-3xl border border-white/20 p-6 shadow-elegant text-left">
              <form onSubmit={handleAnalyzeData} className="space-y-4">
                <div>
                  <textarea
                    value={analysisData}
                    onChange={(e) => setAnalysisData(e.target.value)}
                    placeholder="Paste your data here (e.g., Sales numbers, user logs, or survey results)..."
                    className="w-full min-h-[200px] resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isAnalyzing}
                    className="glass-btn rounded-xl px-8 shadow-glow bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Data"}
                  </Button>
                </div>
              </form>

              {analysisError && (
                <div className="mt-6 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl animate-fade-in">
                  {analysisError}
                </div>
              )}

              {analysisResult && (
                <div className="mt-8 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Sparkles className="h-5 w-5" />
                    AI Summary & Insights
                  </div>
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-sm leading-relaxed whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult);
                      toast.success("Copied to clipboard");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Download className="mr-2 h-3 w-3" /> Copy Result
                  </Button>
                </div>
              )}
            </div>
          </section>
        ) : (
          // Default Search View
          <section className="w-full max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> You're signed in
            </span>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight">
              Welcome, <span className="bg-gradient-primary bg-clip-text text-transparent">{session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || session?.user?.email?.split("@")[0] || "Guest"}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Your workspace is ready. Start building something beautiful.
            </p>

            {/* Glassy Search Box */}
            <div className="mx-auto mt-12 max-w-xl animate-fade-up relative" style={{ animationDelay: "150ms" }}>
              <form 
                onSubmit={handleSearch}
                className="glass-morphism flex items-center overflow-hidden rounded-full p-2 shadow-glow focus-within:ring-2 focus-within:ring-primary/50 transition-all relative z-10"
              >
                <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the web via Serper..." 
                  className="w-full bg-transparent px-4 py-2 text-base outline-none placeholder:text-muted-foreground/70"
                />
                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="glass-btn rounded-full px-8 shadow-glow bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </form>

              {/* Results Dropdown */}
              {(searchResults || searchError) && (
                <div className="absolute top-full left-0 right-0 mt-4 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-elegant animate-fade-in text-left z-50">
                  <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                    {searchError && (
                      <div className="p-4 text-center text-red-400 bg-red-400/10 rounded-xl">
                        {searchError}
                      </div>
                    )}
                    {searchResults?.knowledgeGraph && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                        {searchResults.knowledgeGraph.imageUrl && (
                          <img src={searchResults.knowledgeGraph.imageUrl} alt={searchResults.knowledgeGraph.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{searchResults.knowledgeGraph.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{searchResults.knowledgeGraph.description}</p>
                        </div>
                      </div>
                    )}
                    {searchResults?.organic?.map((result: any, i: number) => (
                      <a 
                        key={i} 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                      >
                        <div className="text-xs text-muted-foreground mb-1">{new URL(result.link).hostname}</div>
                        <h3 className="text-primary-foreground font-medium mb-1 line-clamp-1">{result.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{result.snippet}</p>
                      </a>
                    ))}
                    {searchResults?.organic?.length === 0 && !searchResults?.knowledgeGraph && (
                      <div className="p-8 text-center text-muted-foreground">
                        No results found for "{searchQuery}".
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
