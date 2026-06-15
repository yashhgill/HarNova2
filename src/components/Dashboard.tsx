import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Globe, 
  Code, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Check, 
  Loader2, 
  LogOut, 
  Cpu, 
  Smartphone, 
  Monitor, 
  RefreshCw,
  CreditCard,
  Layers,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
  Coins,
  Flame,
  User,
  Trophy,
  Gift,
  ChevronDown,
  Settings,
  Info,
  Sun,
  Moon,
  Laptop,
  HelpCircle,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Download,
  FolderArchive
} from "lucide-react";
import JSZip from "jszip";
import { HarNovaStore, publishToCDN } from "../services/store";
import { DomainRegistrar } from "../services/domainRegistrar";
import { WebSite, TokenTransaction, UserProfile, ThemePreset, DomainRecord, DnsRecord } from "../types";

interface DashboardProps {
  uid: string;
  userEmail: string;
  onLogout: () => void;
}

export default function Dashboard({ uid, userEmail, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"build" | "sites" | "ledger" | "recharge" | "registrar" | "agent">("build");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [websites, setWebsites] = useState<WebSite[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);

  // --- AI AGENT CONFIG & BUILD STATES ---
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentPalette, setAgentPalette] = useState("obsidian");
  const [agentTypography, setAgentTypography] = useState("sans");
  const [agentTheme, setAgentTheme] = useState<ThemePreset>("modern");
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [agentStep, setAgentStep] = useState<"idle" | "planning" | "building" | "finishing" | "success" | "error">("idle");

  interface AgentBlock {
    id: string;
    name: string;
    desc: string;
    status: "pending" | "streaming" | "completed" | "error";
    html?: string;
  }
  const [agentBlocks, setAgentBlocks] = useState<AgentBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(-1);
  const [cumulativeAgentHtml, setCumulativeAgentHtml] = useState("");
  const [liveStreamText, setLiveStreamText] = useState("");
  const [completedAgentSite, setCompletedAgentSite] = useState<WebSite | null>(null);
  
  // Custom Domain Registrar State variables
  const [ownedDomains, setOwnedDomains] = useState<DomainRecord[]>([]);
  const [domainSearchQuery, setDomainSearchQuery] = useState("");
  const [domainSearchResults, setDomainSearchResults] = useState<any[]>([]);
  const [isSearchingDomains, setIsSearchingDomains] = useState(false);
  const [selectedDomainForManage, setSelectedDomainForManage] = useState<DomainRecord | null>(null);
  const [editingDnsRecords, setEditingDnsRecords] = useState<DnsRecord[]>([]);
  
  const [newDnsType, setNewDnsType] = useState<"A" | "CNAME" | "TXT" | "MX">("A");
  const [newDnsHost, setNewDnsHost] = useState("@");
  const [newDnsValue, setNewDnsValue] = useState("");
  const [newDnsTtl, setNewDnsTtl] = useState(3600);
  
  const [isRegisteringDomainName, setIsRegisteringDomainName] = useState<string | null>(null);
  const [isSavingDnsChanges, setIsSavingDnsChanges] = useState(false);
  const [registrarError, setRegistrarError] = useState("");
  const [registrarSuccess, setRegistrarSuccess] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);

  // States for new website wizard
  const [siteTitle, setSiteTitle] = useState("");
  const [sitePrompt, setSitePrompt] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>("modern");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingStep, setBuildingStep] = useState(0);
  const [buildError, setBuildError] = useState("");

  // Granular Visual parameters & Dynamic fuel/burn properties
  const [selectedPalette, setSelectedPalette] = useState<string>("obsidian");
  const [selectedTypography, setSelectedTypography] = useState<string>("sans");
  const [selectedLayoutState, setSelectedLayoutState] = useState<string>("bento");
  const [selectedSectionsList, setSelectedSectionsList] = useState<string[]>(["hero", "features", "calculator", "faq", "contact", "footer"]);
  const [efficiencyModeState, setEfficiencyModeState] = useState<"eco" | "premium">("eco");

  // Fuel driving simulation variables
  const [fuelTankPercentage, setFuelTankPercentage] = useState<number>(100);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // States for selected website editor
  const [selectedSite, setSelectedSite] = useState<WebSite | null>(null);
  const [editedCode, setEditedCode] = useState("");
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // States for Custom Domain Registry
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [domainVerifyStep, setDomainVerifyStep] = useState<"idle" | "testing" | "matched">("idle");
  const [domainError, setDomainError] = useState("");

  // States for billing modal/fields
  const [isPaying, setIsPaying] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPack, setSelectedPack] = useState<{name: string, tokens: number, price: number} | null>(null);

  // States for Dedicated Token Shop Modal
  const [isTokenShopOpen, setIsTokenShopOpen] = useState(false);
  const [tokenShopSelectedPack, setTokenShopSelectedPack] = useState<{name: string, tokens: number, price: number} | null>(null);
  const [isTokenShopPaying, setIsTokenShopPaying] = useState(false);
  const [tokenShopCardNum, setTokenShopCardNum] = useState("");
  const [tokenShopCardExpiry, setTokenShopCardExpiry] = useState("");
  const [tokenShopCardCvc, setTokenShopCardCvc] = useState("");
  const [tokenShopPaymentSuccess, setTokenShopPaymentSuccess] = useState(false);
  const [tokenShopError, setTokenShopError] = useState("");

  // States for Ledger Tab Filtering and Search
  const [ledgerFilter, setLedgerFilter] = useState<"all" | "purchase" | "consumption">("all");
  const [ledgerSearch, setLedgerSearch] = useState("");

  const [isZipping, setIsZipping] = useState(false);

  // Custom HUD and Credit Dropdown states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const steps = [
    "Deducting token credential...",
    "Sending visual layout variables to Gemini AI...",
    "Compiling responsive Tailwind grid system...",
    "Structuring Lucide icons & components...",
    "Deploying static page on HarNova CDN node..."
  ];

  useEffect(() => {
    loadDashboardData();
  }, [uid]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const profile = await HarNovaStore.getUserProfile(uid);
      setUserProfile(profile);

      const userSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(userSites);
      if (userSites.length > 0 && !selectedSite) {
        setSelectedSite(userSites[0]);
        setEditedCode(userSites[0].htmlContent);
        setCustomDomainInput(userSites[0].customDomain || "");
      }

      // Load owned domains
      const userDomains = await DomainRegistrar.getUserDomains(uid);
      setOwnedDomains(userDomains);
      if (userDomains.length > 0 && !selectedDomainForManage) {
        setSelectedDomainForManage(userDomains[0]);
        setEditingDnsRecords([...userDomains[0].dnsRecords]);
      }

      const txs = await HarNovaStore.getTransactions(uid);
      setTransactions(txs);
    } catch (e) {
      console.error("Failed to load HarNova workspace data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Agent sequential streaming flow
  const runAgenticBuild = async () => {
    if (!agentPrompt.trim()) {
      setAgentError("Please enter a detailed prompt representing your web concept.");
      return;
    }
    if (userProfile && userProfile.tokens < 1) {
      setAgentError("Your credit balance is dry! Please recharge tokens to launch the AI compilation agent.");
      return;
    }

    setIsAgentRunning(true);
    setAgentError("");
    setCompletedAgentSite(null);
    setAgentStep("planning");
    setLiveStreamText("");
    setCumulativeAgentHtml("");
    setCurrentBlockIndex(-1);

    try {
      const planRes = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: agentPrompt })
      });
      if (!planRes.ok) throw new Error("Agent scheduler was unable to bootstrap layout roadmap.");
      const planData = await planRes.json();
      
      const plannedBlocks: AgentBlock[] = (planData.blocks || []).map((b: any) => ({
        ...b,
        status: "pending" as const,
        html: ""
      }));
      setAgentBlocks(plannedBlocks);

      if (plannedBlocks.length === 0) {
        throw new Error("Zero layout blocks planned.");
      }

      setAgentStep("building");
      let currentHtmlAccumulator = "";

      let fontLink = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@355;400;600&display=swap" rel="stylesheet">';
      let fontSans = "'Inter', sans-serif";
      let fontSerif = "'Inter', sans-serif";
      let fontClass = "font-sans";

      if (agentTypography === "serif") {
        fontLink = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">';
        fontSans = "'Inter', sans-serif";
        fontSerif = "'Playfair Display', serif";
        fontClass = "font-serif";
      } else if (agentTypography === "sans") {
        fontLink = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@300;400;650&display=swap" rel="stylesheet">';
        fontSans = "'Inter', sans-serif";
        fontSerif = "'Outfit', sans-serif";
        fontClass = "font-display";
      } else if (agentTypography === "mono") {
        fontLink = '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">';
        fontSans = "'JetBrains Mono', monospace";
        fontSerif = "'JetBrains Mono', monospace";
        fontClass = "font-mono";
      } else if (agentTypography === "rounded") {
        fontLink = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Comfortaa:wght@400;700&display=swap" rel="stylesheet">';
        fontSans = "'Outfit', sans-serif";
        fontSerif = "'Comfortaa', cursive";
        fontClass = "font-display";
      }

      let bgClass = "bg-slate-950 text-slate-100";
      let accentCol = "amber-500";
      if (agentPalette === "forest") {
        bgClass = "bg-[#fcfaf6] text-[#0b2f27]";
        accentCol = "emerald-800";
      } else if (agentPalette === "cyberpunk") {
        bgClass = "bg-black text-[rgb(0,240,255)]";
        accentCol = "pink-500";
      } else if (agentPalette === "crimson") {
        bgClass = "bg-zinc-950 text-stone-100";
        accentCol = "rose-650";
      } else if (agentPalette === "arctic") {
        bgClass = "bg-slate-50 text-slate-900";
        accentCol = "sky-600";
      } else if (agentPalette === "ocean") {
        bgClass = "bg-slate-950 text-slate-100";
        accentCol = "teal-500";
      }

      const docHeaderPrefix = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${agentPrompt.substring(0, 30)} - Compiled with HarNova AI Agent</title>
  \${fontLink}
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: [\${fontSans.includes("sans") ? "'Inter'" : fontSans}, "sans-serif"],
            serif: [\${fontSerif.includes("Display") ? "'Playfair Display'" : fontSerif}, "serif"],
            mono: ["'JetBrains Mono'", "monospace"],
            display: [\${agentTypography === 'rounded' ? "'Comfortaa'" : "'Outfit'"}, "sans-serif"]
          }
        }
      }
    }
  </script>
</head>
<body class="\${bgClass} \${fontClass} min-h-screen px-4 py-8 space-y-8 flex flex-col selection:bg-\${accentCol}/20 overflow-x-hidden">`;

      const docFooterSuffix = `
  <script>
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  </script>
</body>
</html>`;

      for (let i = 0; i < plannedBlocks.length; i++) {
        const block = plannedBlocks[i];
        setCurrentBlockIndex(i);

        const latestProfile = await HarNovaStore.getUserProfile(uid);
        if (!latestProfile || latestProfile.tokens < 1) {
          throw new Error("Out of Fuel Credits! Generation halted. Please recharge tokens.");
        }

        setAgentBlocks(prev => prev.map((b, idx) => idx === i ? { ...b, status: "streaming" } : b));
        setLiveStreamText("");

        const response = await fetch("/api/agent/generate-block-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: agentPrompt,
            blockName: block.name,
            theme: agentTheme,
            previousBlocksHtml: currentHtmlAccumulator,
            colorPalette: agentPalette,
            typography: agentTypography
          })
        });

        if (!response.ok) throw new Error(`Block generation pipeline [\${block.name}] failed.`);
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Body reader stream is unresolvable.");
        
        const decoder = new TextDecoder();
        let chunkedBlockHtml = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value);
          chunkedBlockHtml += chunkStr;
          setLiveStreamText(prev => prev + chunkStr);
        }

        const updatedProfile = await HarNovaStore.consumeTokenForBuild(uid, `AI Block: \${block.name}`, 1);
        setUserProfile(updatedProfile);

        block.html = chunkedBlockHtml;
        block.status = "completed";
        setAgentBlocks(prev => prev.map((b, idx) => idx === i ? { ...b, status: "completed", html: chunkedBlockHtml } : b));

        currentHtmlAccumulator += "\n" + chunkedBlockHtml;
        
        const partialHtml = docHeaderPrefix + "\n" + currentHtmlAccumulator + "\n" + docFooterSuffix;
        setCumulativeAgentHtml(partialHtml);

        const txs = await HarNovaStore.getTransactions(uid);
        setTransactions(txs);
      }

      setAgentStep("finishing");

      const finalHtmlContent = docHeaderPrefix + "\n" + currentHtmlAccumulator + "\n" + docFooterSuffix;
      const cleanTitle = "Agent: " + agentPrompt.slice(0, 20) + "...";
      const slugVal = "agent-" + Math.random().toString(36).substring(2, 7);

      const createdSite = await HarNovaStore.createWebsite(uid, {
        title: cleanTitle,
        prompt: agentPrompt,
        theme: agentTheme,
        htmlContent: finalHtmlContent,
        slug: slugVal
      });

      // publish to memory CDN
      await publishToCDN(createdSite);

      const updatedSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(updatedSites);
      setCompletedAgentSite(createdSite);
      setSelectedSite(createdSite);
      setEditedCode(createdSite.htmlContent);

      setAgentStep("success");
    } catch (err: any) {
      console.error(err);
      setAgentError(err.message || String(err));
      setAgentStep("error");
    } finally {
      setIsAgentRunning(false);
    }
  };

  // Build website prompt handler
  const handleCompileWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteTitle || !sitePrompt) {
      setBuildError("Please provide a Title and a Prompt for your webpage.");
      return;
    }

    const tokenCost = efficiencyModeState === "eco" ? 1 : 3;

    if (userProfile && userProfile.tokens < tokenCost) {
      setBuildError(`Insufficient Token Balance! This luxury ${efficiencyModeState === 'eco' ? 'Eco-Drive' : 'Premium-Drive'} build requires ${tokenCost} tokens, but you only have ${userProfile.tokens}.`);
      return;
    }

    setBuildError("");
    setIsBuilding(true);
    setBuildingStep(0);
    setFuelTankPercentage(100);

    // Formulate localized agent simulation comments based on selected custom parameters!
    const compileLogs = [
      `[Ignition] @architect locked in brand title: "${siteTitle}"`,
      `[Engine] @architect activated "${efficiencyModeState === 'eco' ? 'Eco-Drive System (Optimal fuel efficiency, 1 Token)' : 'Premium-Drive System (Maximum design fidelity, 3 Tokens)'}"`,
      `[Navigation] @architect designated "${selectedLayoutState.toUpperCase()}" structural canvas layout...`,
      `[Fuel Tank] Loaded fuel: ${tokenCost} Units. Starting drive...`,
      `[Designer] Calibrating color scheme palette: "${selectedPalette.toUpperCase()}"...`,
      `[Designer] Selecting typography pairs: "${selectedTypography.toUpperCase()}" fonts...`,
      `[Developer] Structuring modular layout container...`,
      `[Developer] Injecting requested app modules: [${selectedSectionsList.join(", ")}]`,
      ...((selectedSectionsList.includes("calculator")) ? [
        `[Developer] Calibrating mathematical variables for interactive utility calculator...`,
        `[Developer] Binding responsive state event listeners...`
      ] : []),
      `[Linter] Verifying WCAG accessibility contrast and fluid responsive grid points...`,
      `[CDN Node] Bundling Lucide assets and compiling custom inline layouts...`,
      `[Deployer] Destination reached safely! Deployed production page on HarNova CDN node.`
    ];

    setSimulationLogs([compileLogs[0]]);

    let logIdx = 1;
    const logInterval = setInterval(() => {
      if (logIdx < compileLogs.length - 1) {
        setSimulationLogs(prev => [...prev, compileLogs[logIdx]]);
        // Deplete visual mileage fuel from 100% down to 25% or 30% linearly as we approach
        setFuelTankPercentage(prev => Math.max(15, Math.round(100 - (logIdx / (compileLogs.length - 1)) * 80)));
        logIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 1100);

    try {
      // 1. Deduct exact Token (Eco = 1, Premium = 3)
      const updatedProfile = await HarNovaStore.consumeTokenForBuild(uid, siteTitle, tokenCost);
      setUserProfile(updatedProfile);

      // 2. Perform server side Gemini code compilation passing visual parameters
      const slug = siteTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const generatedResult = await HarNovaStore.generateAISite(
        sitePrompt,
        selectedTheme,
        siteTitle,
        selectedPalette,
        selectedTypography,
        selectedLayoutState,
        selectedSectionsList,
        efficiencyModeState
      );

      // Wait a little bit for logs to complete beautifully to finish the car trip effect!
      const remainingStepsToWait = compileLogs.length - 1 - logIdx;
      if (remainingStepsToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingStepsToWait * 1100 + 500));
      }
      clearInterval(logInterval);

      // Finalize destination arrived
      setSimulationLogs(prev => [...prev, compileLogs[compileLogs.length - 1]]);
      setFuelTankPercentage(15); // final remaining level

      // 3. Register Website configuration in database
      const createdSite = await HarNovaStore.createWebsite(uid, {
        title: generatedResult.title,
        prompt: sitePrompt,
        theme: selectedTheme,
        htmlContent: generatedResult.htmlContent,
        slug: slug
      });

      // Update lists
      const updatedSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(updatedSites);
      setSelectedSite(createdSite);
      setEditedCode(createdSite.htmlContent);
      setCustomDomainInput("");
      setDomainVerifyStep("idle");

      // Auto route to websites view
      setSiteTitle("");
      setSitePrompt("");
      setIsBuilding(false);
      setActiveTab("sites");

      // Log transactions
      const txs = await HarNovaStore.getTransactions(uid);
      setTransactions(txs);
    } catch (error: any) {
      console.error("Compilation failed during drive:", error);
      setBuildError(error.message || "An unexpected compile-time error occurred during AI synthesis.");
      clearInterval(logInterval);
      setIsBuilding(false);
    }
  };

  // Modify HTML layout directly in real-time
  const handleUpdateCode = async () => {
    if (!selectedSite) return;
    setIsUpdatingCode(true);
    setUpdateSuccess(false);

    try {
      const updatedSite = {
        ...selectedSite,
        htmlContent: editedCode
      };
      await HarNovaStore.updateWebsite(updatedSite);
      
      const updatedSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(updatedSites);
      setSelectedSite(updatedSite);
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to commit source modifications:", e);
    } finally {
      setIsUpdatingCode(false);
    }
  };

  // Handle pointer custom domain matching simulation
  const handleVerifyCustomDomain = async () => {
    if (!selectedSite || !customDomainInput) return;
    setIsVerifyingDomain(true);
    setDomainError("");
    setDomainVerifyStep("testing");

    // Simulate looking up DNS tables
    setTimeout(async () => {
      try {
        const updatedSite = {
          ...selectedSite,
          customDomain: customDomainInput,
          domainStatus: "active" as const
        };
        await HarNovaStore.updateWebsite(updatedSite);
        
        const updatedSites = await HarNovaStore.getUserWebsites(uid);
        setWebsites(updatedSites);
        setSelectedSite(updatedSite);
        
        setDomainVerifyStep("matched");
        setIsVerifyingDomain(false);
      } catch (err) {
        setDomainError("Failed to update domain registration variables.");
        setDomainVerifyStep("idle");
        setIsVerifyingDomain(false);
      }
    }, 3000);
  };

  const handleDeleteWebsite = async (siteId: string) => {
    if (!confirm("Are you sure you want to permanently delete this hosted webpage? This is irreversible.")) return;
    try {
      await HarNovaStore.deleteWebsite(siteId, uid);
      const updatedSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(updatedSites);
      
      if (updatedSites.length > 0) {
        setSelectedSite(updatedSites[0]);
        setEditedCode(updatedSites[0].htmlContent);
        setCustomDomainInput(updatedSites[0].customDomain || "");
      } else {
        setSelectedSite(null);
        setEditedCode("");
        setCustomDomainInput("");
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  // ==========================================
  // DOMAIN REGISTRAR HANDLER OPERATIONS
  // ==========================================

  const handleSearchDomains = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainSearchQuery.trim()) return;
    setIsSearchingDomains(true);
    setRegistrarError("");
    setRegistrarSuccess("");
    try {
      const results = await DomainRegistrar.searchDomainAvailability(domainSearchQuery);
      setDomainSearchResults(results);
    } catch (err: any) {
      setRegistrarError("Failed to fetch domain availability. Please try again.");
    } finally {
      setIsSearchingDomains(false);
    }
  };

  const handlePurchaseDomain = async (domainName: string, tokenCost: number) => {
    if (!userProfile) return;
    if (userProfile.tokens < tokenCost) {
      setRegistrarError(`Insufficient Token Balance! Registrations for ${domainName} require ${tokenCost} tokens. Please recharge.`);
      return;
    }
    setIsRegisteringDomainName(domainName);
    setRegistrarError("");
    setRegistrarSuccess("");
    try {
      const newDomain = await DomainRegistrar.registerDomain(uid, domainName, tokenCost);
      setRegistrarSuccess(`Successfully registered ${domainName}! You can now map this domain to any generated page.`);
      
      const updatedProfile = await HarNovaStore.getUserProfile(uid);
      setUserProfile(updatedProfile);
      
      const userDomains = await DomainRegistrar.getUserDomains(uid);
      setOwnedDomains(userDomains);

      const userSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(userSites);
      
      const txs = await HarNovaStore.getTransactions(uid);
      setTransactions(txs);

      handleSelectDomainForManage(newDomain);
      setDomainSearchQuery("");
      setDomainSearchResults([]);
    } catch (err: any) {
      setRegistrarError(err.message || "Domain registration failed.");
    } finally {
      setIsRegisteringDomainName(null);
    }
  };

  const handleSelectDomainForManage = (domain: DomainRecord) => {
    setSelectedDomainForManage(domain);
    setEditingDnsRecords([...domain.dnsRecords]);
    setNewDnsHost("@");
    setNewDnsValue("");
    setNewDnsType("A");
    setNewDnsTtl(3600);
    setRegistrarError("");
    setRegistrarSuccess("");
  };

  const handleAddDnsRecord = () => {
    if (!newDnsValue.trim()) {
      setRegistrarError("Please enter a valid DNS record target route/value.");
      return;
    }
    const record: DnsRecord = {
      id: "dns-" + Math.random().toString(36).substring(2, 6),
      type: newDnsType,
      host: newDnsHost || "@",
      value: newDnsValue,
      ttl: newDnsTtl
    };
    setEditingDnsRecords([...editingDnsRecords, record]);
    setNewDnsValue("");
    setNewDnsHost("@");
    setRegistrarError("");
  };

  const handleDeleteDnsRecord = (id: string) => {
    setEditingDnsRecords(editingDnsRecords.filter(r => r.id !== id));
  };

  const handleSaveDnsZone = async () => {
    if (!selectedDomainForManage) return;
    setIsSavingDnsChanges(true);
    setRegistrarError("");
    setRegistrarSuccess("");
    try {
      await DomainRegistrar.updateDnsRecords(uid, selectedDomainForManage.id, editingDnsRecords);
      setRegistrarSuccess(`DNS zone files successfully committed for ${selectedDomainForManage.domainName}.`);
      
      const updatedDomains = await DomainRegistrar.getUserDomains(uid);
      setOwnedDomains(updatedDomains);
      
      const target = updatedDomains.find(d => d.id === selectedDomainForManage.id);
      if (target) {
        setSelectedDomainForManage(target);
      }
    } catch (err: any) {
      setRegistrarError(err.message || "Failed to save DNS zones.");
    } finally {
      setIsSavingDnsChanges(false);
    }
  };

  const handleLinkDomainToWebsite = async (domainId: string, siteId: string) => {
    setRegistrarError("");
    setRegistrarSuccess("");
    try {
      const realSiteId = siteId === "none" ? null : siteId;
      await DomainRegistrar.linkDomainToSite(uid, domainId, realSiteId);
      
      const userDomains = await DomainRegistrar.getUserDomains(uid);
      setOwnedDomains(userDomains);
      
      if (selectedDomainForManage && selectedDomainForManage.id === domainId) {
        const target = userDomains.find(d => d.id === domainId);
        if (target) setSelectedDomainForManage(target);
      }
      
      const userSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(userSites);
      
      // Keep active site selection synced
      if (selectedSite) {
        const found = userSites.find(s => s.id === selectedSite.id);
        if (found) {
          setSelectedSite(found);
          setCustomDomainInput(found.customDomain || "");
        }
      }
      setRegistrarSuccess("Website landing page mapping established!");
    } catch (err: any) {
      setRegistrarError(err.message || "Failed to establish map linking.");
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("Are you sure you want to release and delete this custom domain? This is irreversible.")) return;
    setRegistrarError("");
    setRegistrarSuccess("");
    try {
      await DomainRegistrar.deleteDomain(uid, domainId);
      setRegistrarSuccess("Domain unregistered and released back to available registry pools.");
      
      const userDomains = await DomainRegistrar.getUserDomains(uid);
      setOwnedDomains(userDomains);
      
      if (selectedDomainForManage && selectedDomainForManage.id === domainId) {
        setSelectedDomainForManage(null);
        setEditingDnsRecords([]);
      }
      
      const userSites = await HarNovaStore.getUserWebsites(uid);
      setWebsites(userSites);
      
      if (selectedSite) {
        const found = userSites.find(s => s.id === selectedSite.id);
        if (found) {
          setSelectedSite(found);
          setCustomDomainInput(found.customDomain || "");
        } else {
          setSelectedSite(userSites[0] || null);
          setEditedCode(userSites[0]?.htmlContent || "");
          setCustomDomainInput(userSites[0]?.customDomain || "");
        }
      }
    } catch (err: any) {
      setRegistrarError(err.message || "Failed to unregister domain.");
    }
  };

  // Buy token pkg payment simulation
  const triggerBuyPackFlow = (pack: {name: string, tokens: number, price: number}) => {
    setSelectedPack(pack);
    setPaymentSuccess(false);
    setCardNum("");
    setCardExpiry("");
    setCardCvc("");
    setActiveTab("recharge");
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack || !userProfile) return;
    setIsPaying(true);

    setTimeout(async () => {
      try {
        const updatedProfile = await HarNovaStore.purchaseTokens(uid, selectedPack.tokens, selectedPack.name);
        setUserProfile(updatedProfile);
        setPaymentSuccess(true);
        setTimeout(() => {
          setSelectedPack(null);
          setPaymentSuccess(false);
          setActiveTab("build");
        }, 2000);

        // Fetch logs
        const txs = await HarNovaStore.getTransactions(uid);
        setTransactions(txs);
      } catch (e) {
        console.error("Recharge ledger error:", e);
      } finally {
        setIsPaying(false);
      }
    }, 2500);
  };

  const handleTokenShopPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenShopSelectedPack || !userProfile) return;
    setIsTokenShopPaying(true);
    setTokenShopError("");

    setTimeout(async () => {
      try {
        const updatedProfile = await HarNovaStore.purchaseTokens(uid, tokenShopSelectedPack.tokens, tokenShopSelectedPack.name);
        if (updatedProfile) {
          setUserProfile(updatedProfile);
          setTokenShopPaymentSuccess(true);
          
          // Refresh transactions ledger
          const txs = await HarNovaStore.getTransactions(uid);
          setTransactions(txs);

          setTimeout(() => {
            setTokenShopSelectedPack(null);
            setTokenShopPaymentSuccess(false);
            setIsTokenShopOpen(false);
            setTokenShopCardNum("");
            setTokenShopCardExpiry("");
            setTokenShopCardCvc("");
          }, 2000);
        } else {
          throw new Error("Database was unable to complete token balance update.");
        }
      } catch (err: any) {
        setTokenShopError(err.message || "Simulated payment failed.");
      } finally {
        setIsTokenShopPaying(false);
      }
    }, 1500);
  };

  const handleDownloadZip = async (site: WebSite) => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Use currently edited text if selectedSite is the one being downloaded, otherwise fallback to unmodified content
      const htmlToDownload = (selectedSite?.id === site.id) ? editedCode : site.htmlContent;

      // 1. Add compiled index.html
      zip.file("index.html", htmlToDownload);

      // 2. Add local sandbox development configuration package.json
      const packageJsonContent = JSON.stringify({
        name: site.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"),
        version: "1.0.0",
        description: `Deployable HTM/Tailwind static landing page for ${site.title}, generated via HarNova AI.`,
        private: true,
        scripts: {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        devDependencies: {
          "vite": "^5.2.0"
        }
      }, null, 2);
      zip.file("package.json", packageJsonContent);

      // 3. Add rich markdown guide README.md
      const readmeContent = `# ${site.title}

A beautifully compiled, fully deployable HTML & Tailwind CSS package generated by the **HarNova AI Engine**.

## 🚀 Quick Starter Guide
You can run this landing page using two methods:

### Method A: No Tools Required (Instant Open)
Simply open the \`index.html\` file directly in any browser of your choice.

### Method B: Local Development Server (Recommended for Customizing)
This folder features a complete local Hot-Reload server using **Vite**.

1. Ensure you have [Node.js](https://nodejs.org) downloaded and available on your system.
2. In your terminal, change into this unzipped directory:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. View the real-time compiled workspace inside your local browser!

## 🪐 Static Production Deployments
This compiled project can be easily uploaded and served across edge-computing clouds like:
- **Netlify**: Drop this directory to any Netlify dashboard.
- **Vercel**: Deploy through standard terminal Vercel integrations (\`vercel\`).
- **Pages**: Publish the static build to GitHub Pages.

---
*Autonomous compilation logged on ${new Date().toLocaleDateString()} via HarNova.*
`;
      zip.file("README.md", readmeContent);

      // Generate ZIP package of bytes
      const fileBytes = await zip.generateAsync({ type: "blob" });
      
      // Stream file directly to local client browser context
      const url = window.URL.createObjectURL(fileBytes);
      const hostLink = document.createElement("a");
      hostLink.href = url;
      hostLink.download = `${site.title.toLowerCase().replace(/\s+/g, "_")}_harnova_package.zip`;
      document.body.appendChild(hostLink);
      hostLink.click();
      document.body.removeChild(hostLink);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP pipeline compilation error:", error);
    } finally {
      setIsZipping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading HarNova SaaS Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Upper header navigation board */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                HN
              </div>
              <span className="font-bold text-sm tracking-tight text-white">HarNova Workspace</span>
            </div>
            
            {/* Main Tabs switcher */}
            <nav className="hidden md:flex items-center space-x-1.5 bg-slate-900 border border-slate-800/80 p-0.5 rounded-lg text-xs">
              <button 
                onClick={() => setActiveTab("build")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${activeTab === 'build' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Assemble Site
              </button>
              <button 
                onClick={() => setActiveTab("agent")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${activeTab === 'agent' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                AI Agent workspace
              </button>
              <button 
                onClick={() => setActiveTab("sites")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${activeTab === 'sites' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Hosting & Domains ({websites.length})
              </button>
              <button 
                onClick={() => setActiveTab("registrar")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${activeTab === 'registrar' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Domain Registrar ({ownedDomains.length})
              </button>
              <button 
                onClick={() => setActiveTab("ledger")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${activeTab === 'ledger' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Transaction ledger
              </button>
            </nav>
          </div>

          {/* User profile with active token counters */}
          <div className="flex items-center space-x-3.5">
            {/* Daily Streak Flame indicator */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-850 text-xs font-mono font-semibold text-emerald-400" title="Active builder streak">
              <Flame className="w-3.5 h-3.5 fill-emerald-500/20 animate-pulse text-emerald-400" />
              <span>{websites.length}</span>
            </div>

            {/* Gold/Yellow Credits selector with 20% more red badge */}
            <button 
              onClick={() => {
                setIsTokenShopOpen(true);
              }}
              className="relative flex items-center space-x-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 px-3.5 py-1.5 rounded-full text-xs font-black text-slate-950 transition shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950" />
              <span>Credits</span>
              <span className="absolute -top-2.5 -right-2 bg-rose-600 text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce shadow border border-slate-950">
                20% more
              </span>
            </button>

            {/* Extra Earn Reward indicator */}
            <button 
              onClick={() => {
                alert(`🚀 HarNova Affiliate Program: Share your unique builder credentials key ${uid.toUpperCase().slice(0, 8)} to earn RM800 cash credit once they active!`);
              }}
              className="hidden sm:flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-orange-400" />
              <span>Earn RM800</span>
            </button>

            {/* Circular Profile trigger button & indicator */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-orange-650 to-amber-650 flex items-center justify-center font-bold text-white text-xs border border-orange-500/30 hover:border-orange-400/50 transition cursor-pointer focus:outline-none relative"
              >
                {userEmail ? userEmail[0].toUpperCase() : "U"}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
              </button>

              {/* Dropdown Menu Container exactly styled like screenshot */}
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800/90 rounded-2xl p-4 shadow-2xl z-50 text-left font-sans space-y-4"
                >
                  {/* User profile / email */}
                  <div className="space-y-1 pb-3 border-b border-slate-850">
                    <span className="text-[9px] font-mono tracking-wider text-slate-500 block uppercase">Connected Session</span>
                    <span className="text-xs font-semibold text-slate-200 block truncate" title={userEmail}>{userEmail}</span>
                    
                    {/* Project selection simulation exactly like screenshot */}
                    <div className="mt-2.5 p-2 bg-slate-950/70 border border-slate-850 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-950 transition">
                      <div className="flex items-center space-x-2">
                        <span className="h-5 w-5 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                          {userEmail ? userEmail[0].toUpperCase() : "R"}
                        </span>
                        <div>
                          <span className="text-[11px] font-bold text-white block">Raju's Project</span>
                          <span className="text-[9px] text-slate-500 block">Owner • 1 member</span>
                        </div>
                      </div>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </div>
                  </div>

                  {/* Credits Nest Block exactly like screenshot */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850/65 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-500">Credits</span>
                        <Info className="w-3 h-3 text-slate-600" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span className="text-xs font-mono font-extrabold text-white">
                          {userProfile?.tokens ?? 0} Fuel
                        </span>
                      </div>
                    </div>

                    {/* Grand Credits Display Block */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold font-mono text-white tracking-tighter">
                        {userProfile?.tokens ?? 0}.00
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">MYR Wallet</span>
                    </div>

                    {/* Yellow Buy Credits star Button */}
                    <button
                      onClick={() => {
                        setIsTokenShopOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Buy Credits</span>
                    </button>
                  </div>

                  {/* Menu List Options */}
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        alert("RM800 Affiliate Referral Code is copied to your clipboard!");
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:bg-slate-850/60 transition group text-[11px]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Gift className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium group-hover:text-white transition">Refer and Earn RM800</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    </button>

                    <button 
                      onClick={() => {
                        setIsTokenShopOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:bg-slate-850/60 transition group text-[11px]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CreditCard className="w-4 h-4 text-orange-400" />
                        <span className="font-medium group-hover:text-white transition">Manage Plan</span>
                      </div>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-500/15 font-bold uppercase tracking-wider">
                        Standard
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        alert("Account credentials and settings are safely stored.");
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:bg-slate-850/60 transition group text-[11px]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="font-medium group-hover:text-white transition">Account Settings</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    </button>

                    <button 
                      onClick={() => {
                        alert("Current preferred language: English (US) / Bahasa Melayu support enabled.");
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:bg-slate-850/60 transition group text-[11px]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="font-medium group-hover:text-white transition">Language</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">English</span>
                    </button>

                    <button 
                      onClick={() => {
                        alert("Malaysia/MYR Regional Builders Contest 2026 is active! Submit to win RM5,000 cash.");
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:bg-slate-850/60 transition group text-[11px]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium group-hover:text-white transition">Builders Contest</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    </button>

                    <div className="border-t border-slate-850/40 my-2 pt-2"></div>

                    <a 
                      href="https://discord.gg" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl text-slate-400 hover:bg-slate-850/60 hover:text-white transition text-[11px]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        <span>Join Discord Community</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-600" />
                    </a>

                    <button 
                      onClick={() => {
                        alert("Opening Technical Support documentation portal...");
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-slate-400 hover:bg-slate-850/60 hover:text-white transition text-[11px]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span>Help Center & APIs</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>

                  {/* Session Actions Footer */}
                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="flex items-center space-x-2 text-slate-400 hover:text-rose-500 transition font-bold text-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout Workspace</span>
                    </button>

                    {/* System visual theme layout from screenshot */}
                    <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-850 text-slate-500 space-x-1.5 scale-90">
                      <Sun className="w-3.5 h-3.5 text-orange-400 cursor-pointer" title="Light Theme" />
                      <Laptop className="w-3.5 h-3.5 text-slate-400 cursor-pointer" title="System Match" />
                      <Moon className="w-3.5 h-3.5 text-slate-600 cursor-pointer" title="Dark Theme" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Navigation bar */}
        <div className="md:hidden flex h-11 border-t border-slate-900 bg-slate-950 font-medium text-[11px] px-4 space-x-1 justify-around items-center">
          <button onClick={() => setActiveTab("build")} className={`py-1.5 px-2 rounded ${activeTab === 'build' ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>Assemble</button>
          <button onClick={() => setActiveTab("agent")} className={`py-1.5 px-2 rounded ${activeTab === 'agent' ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>Agent</button>
          <button onClick={() => setActiveTab("sites")} className={`py-1.5 px-2 rounded ${activeTab === 'sites' ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>Hosting ({websites.length})</button>
          <button onClick={() => setActiveTab("registrar")} className={`py-1.5 px-2 rounded ${activeTab === 'registrar' ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>Domains ({ownedDomains.length})</button>
          <button onClick={() => setActiveTab("ledger")} className={`py-1.5 px-2 rounded ${activeTab === 'ledger' ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>Ledger</button>
        </div>
      </header>

      {/* Main dashboard view panels */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow">
        
        {/* Low Fuel Token Alert Banner */}
        {userProfile && userProfile.tokens <= 5 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-orange-950/20 border border-amber-500/25 text-xs text-amber-300 text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Low Fuel Credit Warning ({userProfile.tokens} left)</h4>
                <p className="text-slate-400 font-light mt-0.5">Your available AI compiler pipeline tokens are running low. Top up in MYR to keep deploying instant custom websites.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsTokenShopOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black tracking-wider uppercase rounded-lg text-[10px] transition shrink-0 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Recharge RM Now
            </button>
          </motion.div>
        )}
        
        {/* TAB 1: BUILD WEBSITE WIZARD */}
        {activeTab === "build" && (
          <div className="relative">
            {isBuilding ? (
              /* High fidelity digital cockpit compile simulator */
              <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-left shadow-2xl space-y-6">
                
                {/* HUD Title */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                    <span className="font-mono font-extrabold text-sm tracking-widest text-slate-250 uppercase">HarNova Synthesis Core HUD</span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-950 text-orange-400 border border-orange-500/15 uppercase tracking-widest">
                    ACTIVE DRIVE LOGS
                  </span>
                </div>

                {/* Dashboard Instrument Cluster Row */}
                <div className="grid md:grid-cols-12 gap-6">
                  
                  {/* Visual Fuel Tank Gas Gauge */}
                  <div className="md:col-span-6 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">DYNAMIC FUEL GAUGE</span>
                        <span className="text-[10px] font-mono font-semibold text-orange-400 uppercase">DEPLETING IN PROGRESS</span>
                      </div>
                      <div className="text-xl font-bold font-mono tracking-tight text-white flex items-baseline space-x-1">
                        <span>{fuelTankPercentage}%</span>
                        <span className="text-xs text-slate-500 font-light">Fuel Capacity</span>
                      </div>
                    </div>

                    {/* Progress Liquid Tank Bar */}
                    <div className="my-4">
                      <div className="h-6 bg-slate-900 border border-slate-850/80 rounded-lg overflow-hidden relative flex items-center justify-between px-3">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500" 
                          style={{ width: `${fuelTankPercentage}%` }}
                          layoutId="gasGaugeLiquid"
                        />
                        <span className="relative z-10 font-mono text-[9px] font-extrabold text-white tracking-widest uppercase mix-blend-difference select-none flex items-center space-x-1.5">
                          <span>E</span>
                          <span className="text-slate-400">---[|||]-------</span>
                          <span>F</span>
                        </span>
                        <span className="relative z-10 font-mono text-[9px] font-bold text-white tracking-widest mix-blend-difference">{fuelTankPercentage}%</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono leading-relaxed text-slate-400/80 bg-slate-900/40 p-2.5 rounded border border-slate-850/30">
                      BURNING: <strong className="text-white">{efficiencyModeState === "eco" ? "1.0 Fuel Token" : "3.0 Fuel Tokens"}</strong> <br />
                      This represents real-time token deduction relative to the code density requested by your visual choices.
                    </div>
                  </div>

                  {/* Visual Live Highway Map */}
                  <div className="md:col-span-6 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block mb-1.5">LIVE CDN TRANSIT HIGHWAY</span>
                      <p className="text-[10px] text-slate-400 leading-normal font-light">
                        Driving your custom assets and components from the compilation staging lab directly onto the Live Edge CDN.
                      </p>
                    </div>

                    {/* Animated literal physical road! */}
                    <div className="relative h-14 bg-slate-900 rounded-lg border-y border-dashed border-slate-800 flex items-center px-4 overflow-hidden">
                      {/* Speed dashed lines scrolling background */}
                      <div className="absolute inset-0 flex justify-between items-center opacity-20 select-none tracking-widest">
                        <span className="text-slate-400 font-mono text-xs w-full whitespace-nowrap animate-pulse">
                          - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                        </span>
                      </div>

                      {/* Landmarks */}
                      <div className="absolute left-2 text-[8px] font-mono text-slate-650 font-bold uppercase select-none">LAB</div>
                      <div className="absolute right-2 text-[8px] font-mono text-slate-650 font-bold uppercase select-none">CDN NODE</div>

                      {/* Car object driving from left to right */}
                      <div 
                        className="absolute transition-all duration-300 transform -translate-y-1/2 top-1/2 flex items-center space-x-1.5"
                        style={{ left: `${Math.min(84, Math.max(6, 100 - fuelTankPercentage))}%` }}
                      >
                        <span className="text-xl -scale-x-100 select-none drop-shadow-md">🚗</span>
                        <div className="px-1.5 py-0.5 rounded bg-orange-600/95 text-white font-mono text-[7px] font-extrabold tracking-widest uppercase animate-pulse select-none shadow">
                          TRANSIT
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>MILEAGE CRITICALITY</span>
                      <span className="text-orange-400 font-extrabold">IN TRANSIT</span>
                    </div>
                  </div>
                </div>

                {/* Agent Intercom Communications Terminal block */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">INTER-AGENT COMMUNICATIONS TERMINAL</span>
                    <span className="text-[9px] font-mono text-slate-550">BASED ON CHOSEN PARAMETERS</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs text-slate-350 space-y-2.5 h-48 overflow-y-auto shadow-inner relative leading-relaxed scrollbar-thin">
                    {simulationLogs.map((log, idx) => {
                      let colorClass = "text-slate-400";
                      if (log.includes("[Ignition]")) colorClass = "text-amber-500";
                      if (log.includes("[Engine]")) colorClass = "text-cyan-400 font-semibold";
                      if (log.includes("[Designer]")) colorClass = "text-purple-400";
                      if (log.includes("[Developer]")) colorClass = "text-emerald-400 font-medium";
                      if (log.includes("[Linter]")) colorClass = "text-rose-500";
                      if (log.includes("[Deployer]")) colorClass = "text-green-400 font-bold animate-pulse";
                      
                      return (
                        <div key={idx} className={`${colorClass} flex items-start space-x-2`}>
                          <span className="text-slate-650 shrink-0 select-none">&gt;&gt;</span>
                          <span className="break-all">{log}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* General Status footer notice */}
                <div className="pt-4 border-t border-slate-850 flex items-center space-x-3 text-xs leading-relaxed text-slate-400 font-light">
                  <Cpu className="w-5 h-5 text-orange-455 shrink-0 mt-0.5" />
                  <span>
                    Our high-performance compilation hub parses your design guidelines to structure fully standalone responsive sites. You won't have to pay high pricing for API usage by dynamically configuring visual components.
                  </span>
                </div>
              </div>
            ) : (
              /* Custom Granular Inputs & Visual Cockpit Dashboard Panels */
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Wizard Headline */}
                <div className="text-left font-sans">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-semibold text-orange-400 mb-4">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>Granular Visual Parameter Cockpit • Standard CDN Bundled</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-2">Assemble Brand New Deployed Website</h2>
                  <p className="text-slate-400 text-xs font-light">
                    Directly control color palettes, active sections, structural layouts, and typography. No rigid preset constraints.
                  </p>
                </div>

                {buildError && (
                  <div className="p-4 rounded-xl bg-red-950/35 border border-red-500/30 text-xs text-red-300 text-left">
                    {buildError}
                  </div>
                )}

                <form onSubmit={handleCompileWebsite} className="space-y-6 text-left">
                  
                  {/* Primary Details Card */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest font-mono">Website Name / Brand Title</label>
                      <input
                        type="text"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                        placeholder="e.g., Kyoto Specialty Tea Room"
                        required
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/40 px-4 py-3.5 rounded-xl text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-0 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest font-mono">Describe Custom Design Details & copy text</label>
                      <textarea
                        value={sitePrompt}
                        onChange={(e) => setSitePrompt(e.target.value)}
                        placeholder="e.g., A minimalist teahouse menu with pricing calculator. Describe standard values, custom map locations, active ingredient sliders, or anything else you need."
                        rows={5}
                        required
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/40 p-4 rounded-xl text-sm text-slate-150 placeholder-slate-700 focus:outline-none focus:ring-0 transition-all resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* GRANULAR VISUAL PARAMETERS SECTION PANEL (Bento card style) */}
                  <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* Visual Aspect block 1: Color Palettes & Fonts */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                      
                      {/* Color Schemes */}
                      <div>
                        <span className="block text-xs font-bold text-slate-300 mb-3 uppercase tracking-widest font-mono">🎨 Choose Base Color Scheme</span>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { key: "obsidian", name: "Obsidian Slate", desc: "Dark charcoal with warm amber accents", colors: ["bg-slate-950", "bg-amber-500"] },
                            { key: "forest", name: "Emerald Forest", desc: "Cream white with warm forest-green details", colors: ["bg-amber-100", "bg-emerald-800"] },
                            { key: "cyberpunk", name: "Cyberpunk Neon", desc: "Pure matrix black with code pink details", colors: ["bg-black", "bg-pink-500"] },
                            { key: "sunset", name: "Sunset Crimson", desc: "Slate black with ruby sunset tones", colors: ["bg-zinc-950", "bg-rose-600"] },
                            { key: "arctic", name: "Arctic Glare", desc: "Fresh gray-white with freezing sky-blue highlights", colors: ["bg-slate-50", "bg-cyan-500"] },
                            { key: "nautical", name: "Deep Nautical", desc: "Navy dark bg with glowing teal waves", colors: ["bg-slate-900", "bg-teal-400"] }
                          ]).map((pal) => (
                            <div 
                              key={pal.key}
                              onClick={() => setSelectedPalette(pal.key)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${selectedPalette === pal.key ? 'border-orange-500 bg-orange-950/15' : 'border-slate-855 bg-slate-950 hover:bg-slate-900/50'}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-extrabold text-white truncate">{pal.name}</span>
                                <div className="flex space-x-1 shrink-0">
                                  {pal.colors.map((c, i) => (
                                    <span key={i} className={`h-2.5 w-2.5 rounded-full ${c} border border-white/10`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[9px] text-slate-500 leading-normal mt-1">{pal.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Typography picker */}
                      <div>
                        <span className="block text-xs font-bold text-slate-300 mb-3 uppercase tracking-widest font-mono">✍️ Choose Font Typography Pairing</span>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { key: "sans", name: "Outfit Sans", desc: "Geometric Inter styling • SaaS modern feel" },
                            { key: "serif", name: "Garamond Serif", desc: "Luxurious Playfair Display • Warm editorial" },
                            { key: "mono", name: "JetBrains Mono", desc: "Raw technology wireframe • Telemetry grids" },
                            { key: "rounded", name: "Rounded Bubble", desc: "Friendly Comfortaa curves • Casual warmth" }
                          ]).map((typo) => (
                            <div
                              key={typo.key}
                              onClick={() => setSelectedTypography(typo.key)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${selectedTypography === typo.key ? 'border-orange-500 bg-orange-950/15' : 'border-slate-855 bg-slate-950 hover:bg-slate-900/50'}`}
                            >
                              <div>
                                <span className={`text-sm font-extrabold block text-white ${typo.key === 'serif' ? 'font-serif' : typo.key === 'mono' ? 'font-mono' : 'font-sans'}`}>
                                  {typo.name}
                                </span>
                                <span className="text-[9px] text-slate-550 leading-tight mt-1 ml-0.5 block">{typo.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Visual Aspect block 2: Structural Layout & Core active Sections */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                      
                      {/* Structure layouts */}
                      <div>
                        <span className="block text-xs font-bold text-slate-300 mb-3 uppercase tracking-widest font-mono">📐 Choose Structural Grid Layout</span>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { key: "bento", name: "Bento Tile Grid", desc: "Independent bordered boxes stacked tightly" },
                            { key: "split", name: "Asymmetric Column", desc: "Lefthand text details split of widescreen side" },
                            { key: "stacked", name: "Stacked Elegant", desc: "Traditional fluid rows spanning down cleanly" },
                            { key: "minimalist", name: "Breathable Edge", desc: "Large generous blank margins with micro lines" }
                          ]).map((lay) => (
                            <div
                              key={lay.key}
                              onClick={() => setSelectedLayoutState(lay.key)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${selectedLayoutState === lay.key ? 'border-orange-500 bg-orange-950/15' : 'border-slate-855 bg-slate-950 hover:bg-slate-900/50'}`}
                            >
                              <span className="text-xs font-extrabold text-white block">{lay.name}</span>
                              <p className="text-[9px] text-slate-500 leading-normal mt-1">{lay.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Active Page Component Sections */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="block text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">🧩 Active Modular Sections</span>
                          <span className="text-[9px] text-orange-400 font-mono">TOGGLE DIRECTLY</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          {([
                            { key: "hero", label: "Hero Banner 🚀" },
                            { key: "features", label: "Features Grid 🛡️" },
                            { key: "calculator", label: "Interactive Widget 🧮", badge: "CALCULATOR" },
                            { key: "faq", label: "Accordion FAQ 💬" },
                            { key: "contact", label: "Lead Contact 📬" },
                            { key: "footer", label: "Brand Footer 🌐" }
                          ]).map((sec) => {
                            const isSelected = selectedSectionsList.includes(sec.key);
                            return (
                              <div
                                key={sec.key}
                                onClick={() => {
                                  if (isSelected) {
                                    // Keep at least two sections to have a valid page
                                    if (selectedSectionsList.length > 2) {
                                      setSelectedSectionsList(prev => prev.filter(k => k !== sec.key));
                                    }
                                  } else {
                                    setSelectedSectionsList(prev => [...prev, sec.key]);
                                  }
                                }}
                                className={`p-2.5 rounded-xl border cursor-pointer transition select-none flex items-center justify-between ${isSelected ? 'border-orange-500 bg-orange-950/10 text-white' : 'border-slate-855 bg-slate-950 text-slate-500 hover:bg-slate-900'}`}
                              >
                                <span className="text-[10px] font-bold truncate">{sec.label}</span>
                                {sec.badge && (
                                  <span className="text-[7px] text-orange-400 font-mono font-black scale-90 rounded bg-orange-950 px-1 shrink-0">
                                    {sec.badge}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Engine Gas Tank selector (The Efficiency drive mode) */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4 text-[7px] font-mono text-slate-500 tracking-widest uppercase">FUEL ECONOMETER</div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 font-mono flex items-center space-x-2">
                      <Zap className="w-3.5 h-3.5 text-orange-500" />
                      <span>Select Efficiency Fuel economy Mode</span>
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* ECO CARD */}
                      <div
                        onClick={() => setEfficiencyModeState("eco")}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${efficiencyModeState === 'eco' ? 'border-emerald-500 bg-emerald-950/15' : 'border-slate-850 bg-slate-950 hover:bg-slate-900'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white">Hybrid Eco-Drive Mode</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/20">
                            1 TOKEN FUEL
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mt-2 font-light">
                          Burns fuel at 66% lower rate. Highly compressed visual layers. Recommended for clean landing pages and rapid prototypes.
                        </p>
                      </div>

                      {/* PREMIUM CARD */}
                      <div
                        onClick={() => setEfficiencyModeState("premium")}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${efficiencyModeState === 'premium' ? 'border-orange-500 bg-orange-950/15' : 'border-slate-850 bg-slate-950 hover:bg-slate-900'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white">Premium Dual-Motor Mode</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-400 font-bold border border-orange-500/20">
                            3 TOKENS FUEL
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mt-2 font-light">
                          Full-capacity fuel tank. Compiles extensive multi-step visual constraints, deep styled sections, custom widgets, and complete interactive JS pricing scripts.
                        </p>
                      </div>
                    </div>

                    {/* Fuel depletion preview metric */}
                    <div className="mt-5 pt-4 border-t border-slate-950 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-slate-500 gap-2">
                      <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        <span>Wallet Fuel Tank Balance: <strong>{userProfile?.tokens ?? 0} TOKENS</strong></span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        ESTIMATED COST: <span className="font-extrabold text-white">{efficiencyModeState === "eco" ? "1 Fuel Unit" : "3 Fuel Units"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Synthesis Submission CTA */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="w-full md:w-auto px-10 py-4 bg-orange-650 hover:bg-orange-600 rounded-xl text-white font-bold text-sm tracking-widest uppercase transition shadow-lg shadow-orange-650/15 cursor-pointer flex items-center justify-center space-x-2.5 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Ignite Core Compiler & Deploys Portals</span>
                    </button>
                  </div>
                </form>

                {/* Popular Presets Quick Picker */}
                <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl text-left">
                  <h3 className="text-sm font-bold mb-4 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    <span>Popular Creative Presets</span>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div 
                      onClick={() => {
                        setSiteTitle("Zen Cafe & Roasters");
                        setSitePrompt("A highly aesthetic organic coffee teahouse portal. Neutral tones, elegant outlines, specialty brews list, booking slots widget, and elegant copy.");
                        setSelectedPalette("forest");
                        setSelectedTypography("serif");
                        setSelectedTheme("editorial");
                        setSelectedLayoutState("split");
                        setSelectedSectionsList(["hero", "features", "calculator", "contact", "footer"]);
                      }}
                      className="p-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl cursor-pointer transition hover:bg-slate-950/80"
                    >
                      <span className="font-semibold block text-orange-400">Zen Cafe & Roasters</span>
                      <span className="text-slate-500 text-[10px]">Theme: Editorial Serif • Warm Brew • Forest Color</span>
                    </div>

                    <div 
                      onClick={() => {
                        setSiteTitle("Alpha Cybernetics LLC");
                        setSitePrompt("A high-tech cyberpunk telemetry page for robotic hardware engineering. Matrix values in the margin, active metrics sheets, service specifications table.");
                        setSelectedPalette("cyberpunk");
                        setSelectedTypography("mono");
                        setSelectedTheme("brutalist");
                        setSelectedLayoutState("bento");
                        setSelectedSectionsList(["hero", "features", "faq", "contact", "footer"]);
                      }}
                      className="p-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl cursor-pointer transition hover:bg-slate-950/80"
                    >
                      <span className="font-semibold block text-orange-400">Alpha Cybernetics LLC</span>
                      <span className="text-slate-500 text-[10px]">Theme: Brutalist Mono • High Contrast • Cyberpunk Color</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PROGRESSIVE AI AGENT WORKSPACE */}
        {activeTab === "agent" && (
          <div className="grid lg:grid-cols-12 gap-8 text-left">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-sm font-extrabold tracking-widest text-slate-200 uppercase font-mono flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-orange-500" />
                    <span>Agent Compiler Config</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Specify layout aesthetics before launching the compiler session.</p>
                </div>

                {/* Prompt Details */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Detailed Concept Prompt</label>
                  <textarea
                    rows={4}
                    disabled={isAgentRunning}
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    placeholder="Describe your vision (e.g. A gorgeous luxury boutique real estate platform in Kuala Lumpur featuring premium dark slate bento listings, client-side calculator, and custom testimonials...)"
                    className="w-full bg-slate-950 border border-slate-855 focus:border-orange-500/50 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none transition leading-normal scrollbar-none"
                  />
                </div>

                {/* Aesthetic Palette Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Color Aesthetic</label>
                    <span className="text-[9px] font-mono text-orange-400 capitalize bg-orange-600/10 px-2 py-0.5 rounded">{agentPalette}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "obsidian", label: "Obsidian", color: "bg-slate-950" },
                      { id: "forest", label: "Forest", color: "bg-emerald-950" },
                      { id: "cyberpunk", label: "Cyberpunk", color: "bg-pink-900" },
                      { id: "crimson", label: "Crimson", color: "bg-rose-955" },
                      { id: "arctic", label: "Arctic", color: "bg-slate-100 border border-slate-300" },
                      { id: "ocean", label: "Ocean", color: "bg-teal-950" }
                    ].map((p) => (
                      <button
                        key={p.id}
                        disabled={isAgentRunning}
                        onClick={() => setAgentPalette(p.id)}
                        className={`p-2 rounded-xl text-[10px] font-semibold border transition flex flex-col items-center justify-between space-y-1.5 cursor-pointer ${
                          agentPalette === p.id 
                            ? "bg-slate-850 border-orange-500/60 text-white" 
                            : "bg-slate-950/60 border-slate-855 hover:border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${p.color}`} />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography configuration */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Font Pairs</label>
                    <span className="text-[9px] font-mono text-orange-400 uppercase bg-orange-600/10 px-2 py-0.5 rounded">{agentTypography}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "sans", label: "Space Outfit Sans" },
                      { id: "serif", label: "Editorial Serif" },
                      { id: "mono", label: "JetBrains Mono" },
                      { id: "rounded", label: "Comfortaa Rounded" }
                    ].map((font) => (
                      <button
                        key={font.id}
                        disabled={isAgentRunning}
                        onClick={() => setAgentTypography(font.id)}
                        className={`py-2 px-2 rounded-xl text-[10px] font-medium border text-center transition cursor-pointer ${
                          agentTypography === font.id 
                            ? "bg-slate-850 border-orange-500/60 text-white font-bold" 
                            : "bg-slate-950/60 border-slate-855 hover:border-slate-800 text-slate-400"
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action build trigger */}
                <button
                  disabled={isAgentRunning}
                  onClick={runAgenticBuild}
                  className="w-full relative overflow-hidden group py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAgentRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Agent Active...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white fill-white/20" />
                      <span>Launch AI Agent Session</span>
                    </>
                  )}
                </button>

                {/* Warning message inside panel */}
                <div className="text-[10px] leading-relaxed text-slate-500 font-mono text-center">
                  Cost estimation: <strong className="text-orange-400">1.0 token</strong> per compiled layout block component.
                </div>
              </div>
            </div>

            {/* Main Interactive Center Dashboard */}
            <div className="lg:col-span-8 space-y-6">
              {agentStep === "idle" ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative min-h-[480px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 hover:bg-orange-500/10 border border-orange-500/15 py-1 px-3 rounded-full text-[10px] font-semibold text-orange-400 uppercase tracking-widest font-mono">
                      <Zap className="w-3.5 h-3.5 animate-bounce fill-orange-500/20" />
                      <span>Agentic Copilot Staging Lab</span>
                    </div>

                    <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
                      Assemble Bespoke Web Spaces Block-by-Block
                    </h1>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      Unlike traditional templates, the HarNova Agent analyzes your detailed objectives, blueprints a sequenced roadmap of layout blocks, and compiles each segment live. Every compiled block siphons 1.0 token dynamically.
                    </p>
                  </div>

                  {/* Feature Bento overview */}
                  <div className="grid md:grid-cols-2 gap-4 my-4">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="w-7 h-7 rounded bg-amber-500/10 flex items-center justify-center text-amber-400"><Layers className="w-3.5 h-3.5" /></div>
                      <h4 className="text-xs font-bold text-white">Dynamic Step Planning</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Proposes custom blocks (e.g. Calculators, Heros, FAQs) perfectly localized to your concept.</p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="w-7 h-7 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Code className="w-3.5 h-3.5" /></div>
                      <h4 className="text-xs font-bold text-white">Progressive Credit Deductions</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Keeps you in full visual control, siphoning only 1.0 Fuel credit per successfully loaded block.</p>
                    </div>
                  </div>

                  {/* Fast Prompt Suggestions */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">Interactive Idea Prompts</h5>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Organic Fruit Juicery Platform with fresh detox calculator",
                        "Deep Learning Consultant Portfolio in Kuala Lumpur with bento case grids",
                        "Smart EV Retrofitting Landing Page with savings calculator grid",
                        "Minimalist Cabin Airbnb Space with dates reservation console"
                      ].map((idea, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAgentPrompt(idea)}
                          className="text-[10px] text-left border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 px-3 py-2 rounded-lg text-slate-400 transition hover:text-white"
                        >
                          "{idea}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Compilation Agent HUD Console */
                <div className="space-y-6">
                  {/* Status checklist */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3 font-mono">
                      <div className="flex items-center space-x-2">
                        {isAgentRunning && <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />}
                        <span className="font-extrabold text-[11px] tracking-wider text-slate-200 uppercase">
                          AI Agent Action Logs: {agentStep.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[9px] bg-slate-950 font-bold px-2 py-0.5 rounded text-orange-400 border border-orange-500/15">
                        {userProfile ? `${userProfile.tokens} CREDITS ACTIVE` : "N/A"}
                      </span>
                    </div>

                    {/* Progress block timeline items */}
                    <div className="space-y-3 font-mono text-[11px]">
                      {agentStep === "planning" && (
                        <div className="flex items-center space-x-2 text-slate-400 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                          <span>Roadmapping layout structure components...</span>
                        </div>
                      )}

                      {agentBlocks.map((block, idx) => (
                        <div 
                          key={block.id} 
                          className={`flex items-center justify-between p-2 rounded border ${
                            idx === currentBlockIndex 
                              ? "bg-slate-950 border-orange-500/35 text-orange-400 shrink-0" 
                              : block.status === "completed" 
                              ? "bg-slate-950/40 border-slate-850/45 text-slate-400" 
                              : "bg-slate-950/20 border-slate-900/20 text-slate-650"
                          }`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <span className="text-[10px] text-slate-550">#{idx + 1}</span>
                            {block.status === "streaming" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500 shrink-0" />
                            ) : block.status === "completed" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-800 shrink-0" />
                            )}
                            <div className="truncate text-left">
                              <span className="font-bold text-slate-200 block text-xs">{block.name}</span>
                              <span className="text-[9px] text-slate-500 leading-none">{block.desc}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center space-x-2 text-[10px]">
                            {block.status === "streaming" && (
                              <span className="text-[9px] text-orange-400 animate-pulse">Siphoning 1.0 credit...</span>
                            )}
                            {block.status === "completed" && (
                              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">1.0 credit siphoned</span>
                            )}
                            {block.status === "pending" && (
                              <span className="text-[9px] text-slate-600 font-normal">Locked (1.0 token)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Completion success alert block */}
                    {agentStep === "success" && completedAgentSite && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-950/20 border border-emerald-500/25 rounded-xl space-y-3 text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Check className="w-4 h-4 text-emerald-400 font-bold" />
                          <h4 className="font-bold text-white text-xs">Agent Compilation Terminated Successfully!</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Your visual concept website has been synchronized live across all memory CDN nodes. You can access it directly inside our workspace hosting server.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2">
                          <a
                            href={`/site/${completedAgentSite.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] uppercase rounded"
                          >
                            <span>Launch Live Website</span>
                            <ExternalLink className="w-3 h-3 text-slate-950" />
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.origin + `/site/${completedAgentSite.id}`);
                              alert("URL Copied to clipboard!");
                            }}
                            className="px-3 py-1.5 border border-slate-800 hover:bg-slate-850 hover:text-white rounded text-[10px] font-mono text-slate-400 cursor-pointer"
                          >
                            Copy CDN Link
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Error Banner */}
                    {agentStep === "error" && agentError && (
                      <div className="p-4 bg-rose-950/20 border border-rose-500/25 rounded-xl text-left text-xs text-rose-350">
                        <span className="font-extrabold font-mono uppercase text-[9px] text-rose-450 block mb-1">Session Terminated Abnormally</span>
                        {agentError}
                      </div>
                    )}
                  </div>

                  {/* Preview Space */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2 flex-wrap gap-2">
                      <span className="font-mono text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                        REAL-TIME PREVIEW WORKSPACE
                      </span>
                      <div className="flex space-x-2 text-[10px] font-mono">
                        <span className="text-slate-500">Live Frame:</span>
                        <span className="text-orange-400 animate-pulse">Progressive Rendering</span>
                      </div>
                    </div>

                    {/* Render live compilation in sandbox preview */}
                    <div className="w-full h-[410px] bg-slate-950 rounded-xl overflow-hidden border border-slate-850 bg-[linear-gradient(45deg,#030712_25%,#0f172a_25%,#0f172a_50%,#030712_50%,#030712_75%,#0f172a_75%,#0f172a_100%)] bg-[size:28px_28px] relative">
                      {cumulativeAgentHtml ? (
                        <iframe
                          srcDoc={cumulativeAgentHtml}
                          title="Bespoke Workspace preview Sandbox"
                          className="w-full h-full bg-transparent border-0"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-3 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                          <p className="font-mono text-[10px] text-slate-500">Waiting for stream block inputs to initiate preview render...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY HOSTED WEBSITES LISTING & EDITOR preview */}
        {activeTab === "sites" && (
          <div>
            {websites.length === 0 ? (
              <div className="max-w-md mx-auto p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <Globe className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold">No Websites Compiled Yet</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  You haven't compiled any websites yet. Type your custom parameters on the Builder tab to compile your first live webpage on the HarNova CDN.
                </p>
                <button
                  onClick={() => setActiveTab("build")}
                  className="px-5 py-2.5 rounded-xl bg-orange-650 hover:bg-orange-600 text-white font-semibold text-xs tracking-wide transition cursor-pointer"
                >
                  Start Synthesis
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-8 text-left">
                
                {/* Deployed list - Lefthand bar */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hosted Cloud Directories</h3>
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
                    {websites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => {
                          setSelectedSite(site);
                          setEditedCode(site.htmlContent);
                          setCustomDomainInput(site.customDomain || "");
                          setDomainVerifyStep("idle");
                        }}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition relative group ${selectedSite?.id === site.id ? 'border-orange-500 bg-slate-900' : 'border-slate-850 bg-slate-900/40 hover:border-slate-800/80'}`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{site.title}</h4>
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                            {site.theme}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 font-mono mt-2 truncate">
                          SLUG: /site/{site.id}
                        </p>

                        {/* Custom Pointer verification indicators */}
                        {site.customDomain && (
                          <div className="mt-2.5 flex items-center space-x-1 text-[10px] text-green-400">
                            <span className="h-1 w-1 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="font-mono truncate">{site.customDomain}</span>
                          </div>
                        )}

                        <div className="mt-3.5 pt-2 border-t border-slate-950 flex items-center justify-between opacity-80 group-hover:opacity-100 transition">
                          <a
                            href={`/site/${site.id}`}
                            target="_blank"
                            rel="referrer"
                            className="text-[10px] font-semibold text-orange-400 hover:text-orange-300 flex items-center space-x-1"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWebsite(site.id);
                            }}
                            className="p-1 text-slate-600 hover:text-red-400 transition"
                            title="Delete Deployment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Claim pricing packs shortcuts */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-850 text-left space-y-3">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <h4 className="text-xs font-bold text-white">Need more space variables?</h4>
                    <p className="text-[10px] text-slate-500 leading-normal">Recharge custom credits to synthesize extra websites on demand. 1 token = 1 webpage.</p>
                    <button 
                      onClick={() => setActiveTab("recharge")}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-650 hover:bg-orange-600 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Buy Tokens
                    </button>
                  </div>
                </div>

                {/* Editor canvas and simulator view - Righthand main board */}
                <div className="lg:col-span-8 space-y-5">
                  {selectedSite ? (
                    <div className="space-y-6">
                      
                      {/* Interactive responsive device preview selectors */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-850 p-4 rounded-2xl">
                        <div>
                          <h3 className="font-bold text-sm text-white">{selectedSite.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Prompted: <span className="italic text-slate-400">"{selectedSite.prompt.slice(0, 70)}..."</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDownloadZip(selectedSite)}
                            disabled={isZipping}
                            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-850 hover:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                            title="Download deployable HTML/Tailwind ZIP package"
                          >
                            {isZipping ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                            ) : (
                              <FolderArchive className="w-4 h-4 text-orange-400" />
                            )}
                            <span>Download Code</span>
                          </button>

                          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                          <button
                            onClick={() => setPreviewDevice("desktop")}
                            className={`p-2 rounded-lg transition ${previewDevice === 'desktop' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Desktop layout width"
                          >
                            <Monitor className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice("mobile")}
                            className={`p-2 rounded-lg transition ${previewDevice === 'mobile' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Mobile landscape mobile layout width"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                              if (iframe) iframe.src = iframe.src;
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 transition"
                            title="Reload live iframe code"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                      {/* Visual responsive sandbox container */}
                      <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-900 flex justify-center items-stretch h-[480px] shadow-2xl relative">
                        <div 
                          className="transition-all duration-300 flex-grow"
                          style={{ maxWidth: previewDevice === "mobile" ? "375px" : "100%" }}
                        >
                          <iframe
                            id="preview-iframe"
                            src={`/site/${selectedSite.id}`}
                            className="w-full h-full bg-white transition border-0 outline-none"
                            sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                          />
                        </div>
                      </div>

                      {/* Configuration panels (Tabs for Source Code vs. Custom Domains) */}
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* Custom Domain Registry mapping panel (from user request) */}
                        <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl text-left">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-3">
                            <Globe className="w-4 h-4 text-orange-500" />
                            <span>Link Custom Domain API</span>
                          </h4>
                          
                          <p className="text-[10px] text-slate-500 leading-normal mb-4">
                            Point any registered domain (e.g. <code>mycafe.com</code>) to HarNova Edge Server nodes.
                          </p>

                          {domainError && (
                            <div className="p-2.5 mb-3 bg-red-950/40 border border-red-500/20 text-[10px] rounded-lg text-red-300">
                              {domainError}
                            </div>
                          )}

                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customDomainInput}
                                onChange={(e) => setCustomDomainInput(e.target.value)}
                                placeholder="mycafe.com"
                                className="flex-grow bg-slate-950 border border-slate-800 focus:border-orange-500/30 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                              />
                              <button
                                onClick={handleVerifyCustomDomain}
                                disabled={isVerifyingDomain || !customDomainInput}
                                className="px-4 py-2 bg-orange-650 hover:bg-orange-600 rounded-xl text-xs font-bold text-white transition cursor-pointer disabled:opacity-40"
                              >
                                {isVerifyingDomain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Link"}
                              </button>
                            </div>

                            {/* Quick selection from Registrar Owned list */}
                            {ownedDomains.length > 0 && (
                              <div className="text-[10px] space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-850/50">
                                <span className="text-slate-500 font-mono block text-[8px] uppercase tracking-wider">Use Registrar-Owned Domain:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {ownedDomains.map(d => (
                                    <button
                                      key={d.id}
                                      type="button"
                                      onClick={() => {
                                        setCustomDomainInput(d.domainName);
                                      }}
                                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 text-[9px] font-mono cursor-pointer transition"
                                    >
                                      {d.domainName}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Show verification details or mapping records checklist */}
                            {customDomainInput && (
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Configure DNS Zone</div>
                                
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-900 pb-2">
                                  <div>
                                    <span className="text-slate-500">TYPE:</span> <strong className="text-slate-300">A Record</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">POINTS TO IP:</span> <strong className="text-orange-400">76.76.21.21</strong>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <div>
                                    <span className="text-slate-500">PROPAGATION:</span>
                                  </div>
                                  <div>
                                    {domainVerifyStep === "matched" ? (
                                      <span className="text-green-400 font-semibold flex items-center space-x-1">
                                        <Check className="w-3 h-3" />
                                        <span>Active Verified</span>
                                      </span>
                                    ) : domainVerifyStep === "testing" ? (
                                      <span className="text-orange-400 flex items-center space-x-1 animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Resolving...</span>
                                      </span>
                                    ) : (
                                      <span className="text-yellow-400 font-semibold">Unresolved Pending</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct HTML live customizer editor */}
                        <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl text-left">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-3">
                            <Code className="w-4 h-4 text-orange-500" />
                            <span>Web Customizer Code Editor</span>
                          </h4>
                          
                          <p className="text-[10px] text-slate-500 leading-normal mb-4">
                            Need a custom text adjustment? Edit the generated HTML template code directly here and publish instantly.
                          </p>

                          <div className="space-y-4">
                            <textarea
                              value={editedCode}
                              onChange={(e) => setEditedCode(e.target.value)}
                              rows={5}
                              className="w-full p-3 bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-350 focus:outline-none focus:border-orange-500/30 rounded-xl leading-relaxed resize-none"
                            />

                            <div className="flex justify-between items-center">
                              <div>
                                {updateSuccess && (
                                  <span className="text-[10px] text-green-400 font-semibold flex items-center space-x-1">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>CDN Compiled Successfully!</span>
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadZip(selectedSite)}
                                  disabled={isZipping}
                                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                                  title="Download HTML package offline"
                                >
                                  {isZipping ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5 text-orange-400" />
                                  )}
                                  <span>Download ZIP</span>
                                </button>

                                <button
                                  onClick={handleUpdateCode}
                                  disabled={isUpdatingCode}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold tracking-wide transition cursor-pointer"
                                >
                                  {isUpdatingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Commit Modification"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Please select a hosted webpage on the left to inspect.</p>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRANSACTION LEDGER */}
        {activeTab === "ledger" && (() => {
          // Compute summary totals for transparency
          const totalPaidTopups = transactions
            .filter(tx => tx.type === "purchase" && tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0);

          const totalSpendDeductions = transactions
            .filter(tx => tx.type === "consumption" || (tx.type === "purchase" && tx.amount < 0))
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

          // Apply dynamic filters and search terms
          const filteredTransactions = transactions.filter(tx => {
            const matchesSearch = 
              tx.description.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
              tx.id.toLowerCase().includes(ledgerSearch.toLowerCase());
            
            if (!matchesSearch) return false;

            if (ledgerFilter === "purchase") {
              return tx.type === "purchase" && tx.amount > 0;
            }
            if (ledgerFilter === "consumption") {
              return tx.type === "consumption" || (tx.type === "purchase" && tx.amount < 0);
            }
            return true;
          });

          return (
            <div className="max-w-5xl mx-auto space-y-8 text-left">
              {/* Ledger Tab Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/15 py-1 px-3 rounded-full text-[10px] font-semibold text-amber-500 uppercase tracking-widest font-mono mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real-time Financial Audit</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Your Transaction Log</h2>
                  <p className="text-xs text-slate-400 mt-1">Monitor real-time token additions, deployment expenditures, and sandbox simulations.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsTokenShopOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Buy Generation Tokens</span>
                  </button>
                </div>
              </div>

              {/* Analytics Dashboard Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Meter 1: Current Wallet Token Balance */}
                <div className="bg-slate-900 border border-slate-850/80 p-5 rounded-2xl shadow-lg relative overflow-hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.4)_0%,rgba(3,7,18,0.7)_100%)]">
                  <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 select-none opacity-[0.03]">
                    <Coins className="w-24 h-24 text-amber-500" />
                  </div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold tracking-wider">Current Wallet Balance</span>
                  <span className="text-3xl font-mono font-bold text-white mt-2 block">
                    {userProfile?.tokens ?? 0} <span className="text-xs text-slate-500 uppercase tracking-widest block sm:inline">Tokens</span>
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono mt-1 block">
                    RM {(userProfile?.tokens ?? 0).toFixed(2)} MYR Equivalent
                  </span>
                </div>

                {/* Meter 2: Total Top-ups (RM) */}
                <div className="bg-slate-900/65 border border-slate-850/60 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 select-none opacity-[0.02]">
                    <ArrowUpRight className="w-24 h-24 text-green-500" />
                  </div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold tracking-wider">Total Top-ups (Deposits)</span>
                  <span className="text-3xl font-mono font-bold text-green-400 mt-2 block">
                    +{totalPaidTopups} <span className="text-xs text-slate-500 uppercase tracking-widest block sm:inline">Tokens</span>
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Across all starter packs & custom options
                  </span>
                </div>

                {/* Meter 3: Total spent credits (RM) */}
                <div className="bg-slate-900/65 border border-slate-850/60 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 select-none opacity-[0.02]">
                    <ArrowDownLeft className="w-24 h-24 text-rose-500" />
                  </div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold tracking-wider">Total Expensed Credits</span>
                  <span className="text-3xl font-mono font-bold text-rose-400 mt-2 block">
                    -{totalSpendDeductions} <span className="text-xs text-slate-500 uppercase tracking-widest block sm:inline">Tokens</span>
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Bespoke compilations & registrations
                  </span>
                </div>
              </div>

              {/* Filter Controls Panel */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Navigation status tabs */}
                <div className="flex border border-slate-800 rounded-lg p-1 bg-slate-950 max-w-sm w-full md:w-auto">
                  {[
                    { id: "all", label: "All Logs" },
                    { id: "purchase", label: "Top-ups" },
                    { id: "consumption", label: "Deductions" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLedgerFilter(tab.id as any)}
                      className={`flex-1 py-1 px-3 rounded-md text-[11px] font-bold tracking-wide transition uppercase cursor-pointer ${
                        ledgerFilter === tab.id
                          ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Live Search bar */}
                <div className="relative flex-1 max-w-md w-full">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search ledger by transaction ID or description..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/40 focus:outline-none pl-9 pr-4 py-2 text-[11px] text-white rounded-lg placeholder-slate-600 transition"
                  />
                  {ledgerSearch && (
                    <button
                      onClick={() => setLedgerSearch("")}
                      className="absolute inset-y-0 right-3 flex items-center text-[9px] text-slate-500 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Transaction Logs Table */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-950 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        <th className="p-4 w-[160px]">Transaction ID</th>
                        <th className="p-4">Action Summary / Description</th>
                        <th className="p-4 w-[140px]">Transaction Type</th>
                        <th className="p-4 w-[120px] text-right">Amount (Tokens)</th>
                        <th className="p-4 w-[170px]">Timestamp (Local)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/80 font-mono text-[11px]">
                      {filteredTransactions.map((tx) => {
                        const isTopup = tx.type === "purchase" && tx.amount > 0;
                        const isDomain = tx.type === "purchase" && tx.amount < 0;
                        
                        return (
                          <tr key={tx.id} className="hover:bg-slate-950/45 transition">
                            {/* Transaction ID */}
                            <td className="p-4 text-slate-500 font-mono text-[10px]" title={tx.id}>
                              {tx.id}
                            </td>

                            {/* Description */}
                            <td className="p-4 text-slate-200 font-sans font-medium text-left">
                              {tx.description}
                            </td>

                            {/* Categorized Badging */}
                            <td className="p-4">
                              {isTopup ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-950/30 border border-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  <ArrowUpRight className="w-2.5 h-2.5" />
                                  <span>Deposit</span>
                                </span>
                              ) : isDomain ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-950/30 border border-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  <Globe className="w-2.5 h-2.5" />
                                  <span>Domain Registry</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-400 bg-orange-950/30 border border-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  <Cpu className="w-2.5 h-2.5" />
                                  <span>AI Compiler</span>
                                </span>
                              )}
                            </td>

                            {/* Credit Difference */}
                            <td className="p-4 text-right">
                              {isTopup ? (
                                <span className="font-bold text-green-400">
                                  +{tx.amount}
                                </span>
                              ) : (
                                <span className="font-bold text-rose-400">
                                  -{Math.abs(tx.amount)}
                                </span>
                              )}
                            </td>

                            {/* Timestamp */}
                            <td className="p-4 text-slate-500 text-[10px]">
                              {new Date(tx.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-500 font-sans">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Info className="w-6 h-6 text-slate-650" />
                              <h5 className="font-bold text-slate-400 text-xs">No transactions match your filter query.</h5>
                              <p className="text-[10px] text-slate-500">Initiate an AI build or buy tokens to see logs populate.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Spending Transparency Help Banner */}
              <div className="p-5 bg-slate-950/50 border border-slate-850/60 rounded-2xl flex flex-col sm:flex-row gap-4 items-start text-left">
                <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-540 shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">Helpful Transparency Summary</h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Tokens reflect the resource metrics required to generate dynamic files and lease network instances. 
                    AI Compiler blocks cost <strong className="text-amber-400">1.0 credit</strong> per fully assembled layout segment. 
                    Drives compile dynamically depending on optimization mode: Eco-Drive costs <strong className="text-amber-400">10 credits</strong>, and Premium-Drive compiles detailed assets for <strong className="text-amber-400">25 credits</strong>. 
                    Malaysian Registrar leases depend on Domain TLD registry index (e.g. 5 tokens for .link TLD registrations). 
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: RECHARGE PORTAL */}
        {activeTab === "recharge" && (
          <div className="max-w-md mx-auto text-left relative">
            {selectedPack ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative"
              >
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">SECURE HARNOVA CHECKOUT</span>
                    <h3 className="text-lg font-bold text-white mt-1">Recharging Accounts</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPack(null)}
                    className="text-xs text-slate-400 hover:text-slate-100 transition underline underline-offset-4"
                  >
                    Cancel
                  </button>
                </div>

                {paymentSuccess ? (
                  <div className="p-8 text-center bg-slate-950 border border-green-500/25 rounded-xl space-y-3 my-6 animate-pulse">
                    <Check className="w-12 h-12 text-green-400 mx-auto" />
                    <h4 className="font-bold text-white">Payment Confirmed!</h4>
                    <p className="text-xs text-slate-400">+{selectedPack.tokens} Credit Tokens have been loaded to user: {userEmail}.</p>
                  </div>
                ) : (
                  <form onSubmit={handleProcessPayment} className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-baseline mb-6">
                      <div className="text-xs font-semibold text-slate-300">{selectedPack.name}</div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-white">RM {selectedPack.price}</span>
                        <span className="text-[10px] text-slate-500 block">+{selectedPack.tokens} Tokens</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Debit / Credit Card</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={cardNum}
                          onChange={(e) => {
                            // Basic card space formating
                            const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardNum(val);
                          }}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          required
                          className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-orange-500/40 text-xs rounded-xl text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM / YY"
                          required
                          className="w-full px-3 py-3 bg-slate-950 border border-slate-800 focus:border-orange-500/40 text-xs rounded-xl text-white outline-none text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">CVC</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          maxLength={3}
                          placeholder="•••"
                          required
                          className="w-full px-3 py-3 bg-slate-950 border border-slate-800 focus:border-orange-500/40 text-xs rounded-xl text-white outline-none text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPaying}
                      className="w-full mt-4 py-3.5 bg-orange-650 hover:bg-orange-600 rounded-xl text-sm font-bold text-white transition flex items-center justify-center space-x-2"
                    >
                      {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Credit transaction RM {selectedPack.price}</span>}
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Load Generation Tokens (MYR Pricing)</h2>
                  <p className="text-xs text-slate-400">Recharge tokens instantly in Malaysian Ringgit (MYR). 1 Token = 1 full high-fidelity website build.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Starter Bundle", tokens: 30, price: "RM 39", desc: "For launching simple concepts" },
                    { name: "Founder Pack", tokens: 150, price: "RM 119", desc: "Most select, custom domains mapped" },
                    { name: "SaaS Enterprise", tokens: 600, price: "RM 399", desc: "Unbounded visual sandbox models" }
                  ].map((p, idx) => (
                    <div 
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-850 hover:border-slate-800 transition flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{p.desc}</p>
                        <span className="inline-block mt-2.5 text-[10px] font-mono font-extrabold text-orange-400">+{p.tokens} GENERATIONS</span>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-lg font-extrabold text-white block">{p.price}</span>
                        <button
                          onClick={() => triggerBuyPackFlow({name: p.name, tokens: p.tokens, price: parseFloat(p.price.replace("RM ", ""))})}
                          className="px-4 py-1.5 bg-orange-650 hover:bg-orange-600 rounded-lg text-[10px] font-bold text-white mt-1.5 transition cursor-pointer"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DOMAIN REGISTRAR PANEL */}
        {activeTab === "registrar" && (
          <div className="space-y-8 text-left">
            {/* Header branding */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-semibold text-orange-400 mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>HarNova Virtual Domain Registrar System</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Buy & Link Custom Domains</h2>
                <p className="text-xs text-slate-400">Search available domain extensions, purchase using your generator tokens, and configure DNS zone records instantly.</p>
              </div>

              {/* Quick balance count */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 shrink-0">
                <Zap className="w-5 h-5 text-orange-400 fill-orange-400/20 animate-pulse" />
                <div>
                  <span className="text-[10px] tracking-wider text-slate-500 font-mono block">YOUR TOKEN BALANCE</span>
                  <span className="text-sm font-bold text-orange-300 font-mono">{userProfile?.tokens ?? 0} TOKENS AVAILABLE</span>
                </div>
              </div>
            </div>

            {/* Error / Success alerts */}
            {registrarError && (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300">
                {registrarError}
              </div>
            )}
            {registrarSuccess && (
              <div className="p-4 rounded-xl bg-green-950/30 border border-green-500/30 text-xs text-green-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>{registrarSuccess}</span>
              </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* LEFT BOARD: Search & Registrations */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-orange-400" />
                    <span>Search Available Domains</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Enter a descriptive domain name (e.g. <code>mycoffeepage</code>) to find matches. Registrations are charged in starting credit tokens.</p>

                  <form onSubmit={handleSearchDomains} className="flex gap-2">
                    <input
                      type="text"
                      value={domainSearchQuery}
                      onChange={(e) => setDomainSearchQuery(e.target.value)}
                      placeholder="e.g. mycoffeeshop"
                      required
                      className="flex-grow bg-slate-950 border border-slate-800 focus:border-orange-500/40 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none placeholder-slate-650"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingDomains}
                      className="px-4 py-2.5 bg-orange-655 hover:bg-orange-600 rounded-xl text-xs font-bold text-white transition flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
                    >
                      {isSearchingDomains ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
                    </button>
                  </form>

                  {/* Search results listing */}
                  {domainSearchResults.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-slate-850/60 max-h-[380px] overflow-y-auto">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Available Extensions</div>
                      {domainSearchResults.map((res) => (
                        <div 
                          key={res.domainName}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-100 block truncate">{res.domainName}</span>
                            <span className="text-[10px] font-mono font-bold text-orange-400">
                              Cost: {res.tokenCost} Tokens
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {res.isAvailable ? (
                              <button
                                type="button"
                                onClick={() => handlePurchaseDomain(res.domainName, res.tokenCost)}
                                disabled={isRegisteringDomainName === res.domainName}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-[10px] font-extrabold text-white tracking-wider uppercase transition flex items-center space-x-1 cursor-pointer"
                              >
                                {isRegisteringDomainName === res.domainName ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <span>Register</span>
                                )}
                              </button>
                            ) : (
                              <span className="text-[9px] uppercase font-mono px-2 py-1 rounded bg-slate-900 border border-slate-850 text-slate-500">
                                Taken
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-850 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-orange-400" />
                    <span>How Custom Root Domains Work</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. <strong>Register & Purchase</strong>: Search for a domain. Popular domain zones (.com, .tech, etc.) cost 3-12 tokens.<br/><br/>
                    2. <strong>Link Page Target</strong>: Bind the domain to any of your generated pages with a single click inside the owned listings panel.<br/><br/>
                    3. <strong>Manage Records</strong>: Configure custom virtual CNAME/A tags pointing anywhere in the web world. Real routing resolves instantly in our multi-node CDN cluster.
                  </p>
                </div>
              </div>

              {/* RIGHT BOARD: Managed Domains & DNS details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-400" />
                    <span>My Registered Domains ({ownedDomains.length})</span>
                  </h3>

                  {ownedDomains.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <p className="text-xs text-slate-500">No registered custom domains found for this account.</p>
                      <p className="text-[10px] text-slate-600 font-light">Search and register your first domain in the sidebar registry panel.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {ownedDomains.map((domain) => (
                        <div 
                          key={domain.id}
                          className={`p-4 bg-slate-950 rounded-xl border transition ${selectedDomainForManage?.id === domain.id ? 'border-orange-500/60 bg-slate-900/40 shadow-lg' : 'border-slate-850'}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-slate-100">{domain.domainName}</span>
                                <span className="text-[8px] uppercase font-mono bg-green-950 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                                  {domain.status}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono block mt-1">Expires: {new Date(domain.expiresAt).toLocaleDateString()}</span>
                            </div>

                            {/* Link website select field */}
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">Link site:</span>
                              <select
                                value={domain.linkedSiteId || "none"}
                                onChange={(e) => handleLinkDomainToWebsite(domain.id, e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-[11px] text-slate-200 px-2 py-1 rounded focus:outline-none focus:border-orange-500 cursor-pointer"
                              >
                                <option value="none">No Site Linked</option>
                                {websites.map(site => (
                                  <option key={site.id} value={site.id}>{site.title} ({site.slug})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="pt-3 flex items-center justify-between">
                            {domain.linkedSiteId ? (
                              <a 
                                href={`/site/${domain.linkedSiteId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-mono hover:underline"
                              >
                                <span>Go live site &rarr;</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-normal">Unlinked custom namespace</span>
                            )}

                            <div className="flex items-center space-x-3 text-xs">
                              <button
                                type="button"
                                onClick={() => handleSelectDomainForManage(domain)}
                                className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold transition cursor-pointer"
                              >
                                Configure DNS
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDomain(domain.id)}
                                className="text-[10px] text-slate-600 hover:text-red-400 transition cursor-pointer"
                                title="Release Domain"
                              >
                                Release
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DNS Zone Records Editor Panel */}
                {selectedDomainForManage && (
                  <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-slate-500 block animate-pulse">DNS Zone Active Configurations</span>
                        <h4 className="text-xs font-bold text-white">DNS Zone File Matrix: <code className="text-orange-300">{selectedDomainForManage.domainName}</code></h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDomainForManage(null)}
                        className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {/* New record form inline */}
                    <div className="grid grid-cols-12 gap-2 items-end bg-slate-950 p-4 border border-slate-850 rounded-xl">
                      <div className="col-span-3">
                        <label className="block text-[9px] font-semibold text-slate-400 mb-1.5 uppercase">Type</label>
                        <select
                          value={newDnsType}
                          onChange={(e: any) => setNewDnsType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-200 p-2 rounded focus:outline-none cursor-pointer"
                        >
                          <option value="A">A (IPv4)</option>
                          <option value="CNAME">CNAME</option>
                          <option value="TXT">TXT</option>
                          <option value="MX">MX</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[9px] font-semibold text-slate-400 mb-1.5 uppercase">Host</label>
                        <input
                          type="text"
                          value={newDnsHost}
                          onChange={(e) => setNewDnsHost(e.target.value)}
                          placeholder="@"
                          className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-200 p-2 rounded focus:outline-none font-mono"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-[9px] font-semibold text-slate-400 mb-1.5 uppercase">Value / Target</label>
                        <input
                          type="text"
                          value={newDnsValue}
                          onChange={(e) => setNewDnsValue(e.target.value)}
                          placeholder="76.76.21.21"
                          className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-200 p-2 rounded focus:outline-none font-mono"
                        />
                      </div>

                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={handleAddDnsRecord}
                          className="w-full p-2 bg-slate-800 hover:bg-slate-750 text-white rounded font-bold text-[10px] transition text-center cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Records tables */}
                    <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden text-[10px]">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="bg-slate-900 text-slate-500 uppercase tracking-wider text-[8px] border-b border-slate-850">
                            <th className="p-3">Type</th>
                            <th className="p-3">Host</th>
                            <th className="p-3">Value</th>
                            <th className="p-3">TTL</th>
                            <th className="p-3 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-350">
                          {editingDnsRecords.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-900/10">
                              <td className="p-3 text-orange-400">{r.type}</td>
                              <td className="p-3 text-slate-200">{r.host}</td>
                              <td className="p-3 truncate max-w-[150px] text-slate-200" title={r.value}>{r.value}</td>
                              <td className="p-3 text-slate-500">{r.ttl}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDnsRecord(r.id)}
                                  className="text-slate-650 hover:text-red-400 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {editingDnsRecords.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-600">No DNS Zone records loaded. Add records above.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Commit button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveDnsZone}
                        disabled={isSavingDnsChanges}
                        className="px-5 py-2.5 bg-orange-650 hover:bg-orange-655 rounded-xl text-xs font-bold text-white transition flex items-center justify-center space-x-1 cursor-pointer select-none"
                      >
                        {isSavingDnsChanges ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Commit DNS Zone changes</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-900 py-6 text-center text-slate-600 text-xs">
        &copy; 2026 HarNova Portal. Integrated zero-trust auth modules active.
      </footer>

      {/* Token Shop Modal Overlay */}
      {isTokenShopOpen && (
        <div id="token-shop-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800/90 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto scrollbar-none text-left"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-850 pb-4 mb-6">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded">
                  HarNova Credit Hub
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span>Token Shop</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsTokenShopOpen(false);
                  setTokenShopSelectedPack(null);
                  setTokenShopPaymentSuccess(false);
                  setTokenShopError("");
                }}
                className="text-slate-400 hover:text-white transition bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850 hover:border-slate-700 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {/* Current Balance Visualizer Card */}
            <div className="mb-6 p-4 bg-slate-950/80 border border-slate-850/70 rounded-xl relative overflow-hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.8)_0%,rgba(3,7,18,0.95)_100%)]">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 select-none opacity-5">
                <Coins className="w-32 h-32 text-amber-500" />
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1 block leading-tight">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold tracking-wider">Account ID</span>
                  <span className="text-xs font-semibold text-slate-300 font-mono block truncate max-w-[200px]" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono uppercase tracking-wide font-bold">
                  Wallet Synced
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-850/40">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Current Token Balance</span>
                  <span className="text-lg font-mono font-bold text-slate-250 block">
                    {userProfile?.tokens ?? 0} Tokens
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Current Value in MYR</span>
                  <span className="text-lg font-mono font-bold text-amber-400 block">
                    RM {(userProfile?.tokens ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Conditional Flow Content */}
            {!tokenShopSelectedPack ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Token Pack</h4>
                  <p className="text-[11px] text-slate-505 leading-normal">
                    Recharge tokens instantly in Malaysian Ringgit (MYR). Each token triggers one high-fidelity website compilation or server domain deployment mapping.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "starter", name: "Starter Bundle", tokens: 30, price: "RM 39", desc: "For launching simple concepts" },
                    { id: "founder", name: "Founder Pack", tokens: 150, price: "RM 119", desc: "Most select, custom domains mapped" },
                    { id: "saas", name: "SaaS Enterprise", tokens: 600, price: "RM 399", desc: "Unbounded sandbox simulation models" }
                  ].map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-slate-950/45 border border-slate-850 hover:border-slate-750 hover:bg-slate-950/80 transition flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-slate-200">{p.name}</h5>
                          {p.id === "founder" && (
                            <span className="text-[8px] bg-orange-500/10 text-orange-400 border border-orange-500/15 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                              Best Value
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{p.desc}</p>
                        <span className="inline-block text-[9px] font-mono font-bold text-orange-400 bg-orange-950/30 border border-orange-500/10 px-1.5 py-0.5 rounded mt-1 shadow-sm">
                          +{p.tokens} GENERATIONS
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-white block">{p.price}</span>
                        <button
                          type="button"
                          onClick={() => setTokenShopSelectedPack({name: p.name, tokens: p.tokens, price: parseFloat(p.price.replace("RM ", ""))})}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-450 rounded-lg text-[10px] font-bold text-white mt-2 transition cursor-pointer shadow-md"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850">
                  <div>
                    <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase block">Selected Pack</span>
                    <span className="text-xs font-bold text-white">{tokenShopSelectedPack.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase block">Cost</span>
                    <span className="text-sm font-extrabold text-orange-405">RM {tokenShopSelectedPack.price}</span>
                  </div>
                </div>

                {tokenShopPaymentSuccess ? (
                  <div className="p-6 text-center bg-slate-950/60 border border-green-500/25 rounded-xl space-y-2.5 animate-pulse">
                    <Check className="w-10 h-10 text-green-400 mx-auto" />
                    <h4 className="font-bold text-white text-xs">Payment Confirmed!</h4>
                    <p className="text-[10px] text-slate-400">+{tokenShopSelectedPack.tokens} Tokens have been deposited into your active workspace quota.</p>
                  </div>
                ) : (
                  <form onSubmit={handleTokenShopPayment} className="space-y-4">
                    {tokenShopError && (
                      <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-[10px] text-red-300">
                        {tokenShopError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Debit / Credit Card</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={tokenShopCardNum}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                              setTokenShopCardNum(val);
                            }}
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            required
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-orange-500/40 text-xs rounded-xl text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Expiry</label>
                          <input
                            type="text"
                            value={tokenShopCardExpiry}
                            onChange={(e) => setTokenShopCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            required
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 focus:border-orange-500/40 text-xs rounded-xl text-white outline-none text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">CVC</label>
                          <input
                            type="password"
                            value={tokenShopCardCvc}
                            onChange={(e) => setTokenShopCardCvc(e.target.value)}
                            maxLength={3}
                            placeholder="•••"
                            required
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 focus:border-orange-500/40 text-xs rounded-xl text-white outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTokenShopSelectedPack(null);
                          setTokenShopError("");
                        }}
                        className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isTokenShopPaying}
                        className="flex-1 py-2.5 bg-orange-605 hover:bg-orange-600 rounded-xl text-xs font-bold text-white transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg"
                      >
                        {isTokenShopPaying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Pay RM {tokenShopSelectedPack.price}</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-850/40 text-[9px] text-slate-500 font-mono text-center">
              🔐 Encrypted 256-bit secure Malaysian sandbox payment pipeline active.
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
