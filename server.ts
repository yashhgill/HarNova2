import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize the Google GenAI SDK server-side
// set the User-Agent header to 'aistudio-build' in httpOptions for telemetry.
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI generation will fall back to templates.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI SDK:", error);
}

// Global cached websites for hosting (fallback in-memory db in case user hasn't active Firestore)
interface WebPage {
  id: string;
  title: string;
  prompt: string;
  theme: string;
  htmlContent: string;
  slug: string;
  customDomain?: string;
  domainStatus?: 'unconfigured' | 'pending' | 'active';
  createdAt: string;
  ownerId: string;
}

const memoryDb: Record<string, WebPage> = {};

// REST API for Website Generation
app.post("/api/generate", async (req, res): Promise<any> => {
  const { 
    prompt, 
    theme, 
    customName, 
    colorPalette, 
    typography, 
    layout, 
    activeSections, 
    efficiencyMode 
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required to make your website!" });
  }

  const selectedTheme = theme || "modern";
  const webTitle = customName || "AI Generated Page";
  
  const selectedPalette = colorPalette || "obsidian";
  const selectedTypography = typography || "sans";
  const selectedLayout = layout || "bento";
  const selectedSections = activeSections || ["hero", "features", "calculator", "faq", "contact", "footer"];
  const isEco = efficiencyMode === "eco";

  console.log(`Generating web document for prompt: "${prompt}"`);
  console.log(`Visual Specs - Palette: ${selectedPalette}, Font: ${selectedTypography}, Layout: ${selectedLayout}, Efficiency: ${efficiencyMode}`);

  // Fallback system in case API Key is missing: We generate a gorgeous mockup page immediately!
  if (!ai) {
    console.log("No Gemini API key configured. Generating a superb high-fidelity mock website...");
    const mockHtml = getMockHtmlForPrompt(prompt, selectedTheme, webTitle, selectedPalette, selectedTypography, selectedLayout, selectedSections, efficiencyMode);
    return res.json({
      title: webTitle,
      metaDescription: `A beautiful responsive ${selectedTheme} page for ${prompt}`,
      htmlContent: mockHtml,
    });
  }

  try {
    const systemInstructions = `You are an elite web architect and principal front-end designer at HarNova.
Your goal is to build an outstanding, high-fidelity, complete, single-page website strictly using modern HTML5, Tailwind CSS, Javascript, and Lucide Icons.

THE USER DEMANDED SPECIFIC ADVANCED DESIGN SPECS:
1. Color Palette: "${selectedPalette}"
   - If "obsidian": Deep charcoal-indigo space (#090b0f to #12151c background, dark steel grey cards #1e222b, warm amber glowing accents #f59e0b).
   - If "forest": Soft cream editorial luxury (#fcfbf8 background, deep botanical emerald container #0b2f27, minty accents #10b981, dark green forest headers).
   - If "cyberpunk": Pure high-contrast pitch black (#000000 background, neon teal/electric cyan #00f0ff borders, glowing hot pink text #ff007f, retro hacker green monospace accents).
   - If "crimson": Sophisticated titanium stone (#18181b slate-stone background, steel grey card modules, vibrant crimson blood-red accents #e11d48, red glowing borders).
   - If "arctic": Crystal frosty-blue fresh morning style (#f1f5f9 background, pristine snow-white card rows, icy cold cyan buttons or borders #0ea5e9).
   - If "ocean": Deep majestic navy marine theme (#030712 background, royal ocean slate cards #0f172a, vivid marine wave teal details #14b8a6).

2. Typography: "${selectedTypography}"
   - If "serif": Majestic serif look with Playfair Display Google font for display headlines and Inter/DM Sans for body.
   - If "sans": State-of-the-art Inter display paired with clean sans-serif. Modern tech-forward luxury.
   - If "mono": Tactical tech style with Fira Code or JetBrains Mono, fully monospace typography tags.
   - If "rounded": Friendly rounded aesthetics using Outfit display text with rounded corner modifiers on cards & pills.

3. Structural Layout: "${selectedLayout}"
   - If "bento": Beautiful modular bento grid of card compartments of different sizes and widths.
   - If "sleek_split": Two-column split-pane elements or asymmetrical grids.
   - If "minimalist": Extreme negative space, razor-thin lines, spacious layouts, supreme focus.
   - If "classic_stacked": Traditional beautiful rows with large visual spacing and transition bands.

4. REQUIRED WEBSITE SECTIONS (The page MUST include exactly these modules in order - please fill each with rich customized brand copy and elements):
${selectedSections.map(s => `   - ${s.toUpperCase()}: Build a fully realized, customized ${s} section containing appropriate value propositions or tools.`).join("\n")}

CRITICAL CODE CONCEPTS:
- The output MUST be a complete, fully finished, valid website enclosed in one single HTML file.
- In the <head> of the generated HTML, MUST include:
   - Modern viewport meta
   - Tailwind CSS Play CDN: <script src="https://cdn.tailwindcss.com"></script>
   - Google Font imports fitting the typography (e.g., Playfair Display, Outfit, JetBrains Mono, Inter, Comfortaa) in a link tag.
   - Beautiful custom Tailwind theme overrides in a <script> block to implement custom fonts and colors seamlessly.
   - Lucide Icons CDN to build state-of-the-art vector icons: <script src="https://unpkg.com/lucide@latest"></script>
- If "calculator" is selected: Include an interactive custom utility widget with inputs (e.g. customized loan payoff, dose calculator, water intake guide, server latency calculator, coffee ratio converter) to make the page feel real and responsive!
- Add responsive mobile menu hamburger script, toggling details, feedback lead submission forms with complete custom inline JS scripts, and call lucide.createIcons(); once the DOM is fully loaded.
- Strict restriction: Output ONLY valid JSON structure matching the specified schema. No markdown wrapping. Do not truncate.
${isEco ? "EFFICIENCY SPEED CONSTRAINT: This is in ECO-DRIVE efficiency mode. Write highly concise, extremely clean, dense and responsive HTML/Tailwind to minimize compilation fuel size and maximize responsiveness." : "LUXURY DETAIL CONSTRAINT: This is in PREMIUM-DRIVE detailed mode. Spend abundant tokens detailing nested CSS cards, custom shadows, highly creative copy, extra feature badges, visual background grids, and micro-interactive elements."}`;

    const userPrompt = `Build me a comprehensive, premium static website with the topic: "${prompt}" and title: "${webTitle}". Visual attributes: Palette is ${selectedPalette}, Font pair is ${selectedTypography}, Layout is ${selectedLayout}, and Sections are ${selectedSections.join(", ")}. Ensure maximum contrast, elegant details, outstanding copy, and high-performance CDN compliance.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The catchy, targeted web document title."
            },
            metaDescription: {
              type: Type.STRING,
              description: "Elegant SEO description for search snippet."
            },
            htmlContent: {
              type: Type.STRING,
              description: "Complete self-contained valid index.html markup including styles, scripts, CDN elements, content, forms."
            }
          },
          required: ["title", "metaDescription", "htmlContent"]
        }
      }
    });

    const responseText = response.text || "";
    let data;
    try {
      data = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini. Text content was:", responseText);
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      data = JSON.parse(cleanJson);
    }

    res.json(data);
  } catch (error: any) {
    console.error("Gemini API generation error:", error);
    res.status(500).json({
      error: "Error generating website code.",
      details: error.message || error,
      fallback: getMockHtmlForPrompt(prompt, selectedTheme, webTitle, selectedPalette, selectedTypography, selectedLayout, selectedSections, efficiencyMode)
    });
  }
});

// Hosting Server Endpoint - instant static serving of any site by its ID!
// Users can load their generated webpages instantly in an iframe or new tab!
app.get("/site/:id", (req, res) => {
  const siteId = req.params.id;
  const site = memoryDb[siteId];
  if (site) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(site.htmlContent);
  }
  
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Site Not Found - HarNova Hosting</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen font-sans">
      <div class="max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-2xl">
        <div class="w-16 h-16 bg-red-950/50 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h1 class="text-2xl font-bold tracking-tight mb-2">Website Offline or Relocated</h1>
        <p class="text-slate-400 text-sm mb-6">This website custom page (ID: ${siteId}) is currently being recompiled or deployed in another region.</p>
        <div class="p-4 bg-slate-950 rounded-lg text-xs font-mono text-slate-500 mb-6 text-left">
          ENDPOINT: /site/${siteId}<br>
          HOST: HarNova CDN Cluster<br>
          STATUS: 404_PAGE_MISSING
        </div>
        <a href="/" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-all duration-200">
          Return to HarNova
        </a>
      </div>
    </body>
    </html>
  `);
});

// API for memory db sync (makes offline mode work smoothly alongside Firestore)
app.post("/api/publish", (req, res) => {
  const site: WebPage = req.body;
  if (site && site.id) {
    memoryDb[site.id] = site;
    console.log(`Hosted website synchronized in server-side CDN: ${site.id} (${site.title})`);
    return res.json({ success: true, url: `/site/${site.id}` });
  }
  res.status(400).json({ error: "Invalid site configuration input" });
});

// AI AGENT: Plan modular layout blocks based on prompt details
app.post("/api/agent/plan", async (req, res): Promise<any> => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const defaultBlocks = [
    { id: "hero", name: "Modern Hero Showcase", desc: "Attention-grabbing responsive landing banner with high-contrast copy, subheaders, and CTA triggers." },
    { id: "features", name: "Bento Features Grid", desc: "A modular, beautiful layout of card components outlining core value proportions and services." },
    { id: "calculator", name: "Interactive Computing Widget", desc: "A client-side interactive tool designed to let users calculate or preview system stats in real-time." },
    { id: "faq", name: "FAQ Accordion Console", desc: "An elegant accordion deck answering frequently asked questions, complete with interactive toggles." },
    { id: "contact", name: "Lead Form & Footer", desc: "A customized communication intake form backed by responsive states and copyright footnotes." }
  ];

  if (!ai) {
    console.log("No Gemini API key defined. Directing AI Agent planner to high-fidelity template plan.");
    return res.json({ blocks: defaultBlocks });
  }

  try {
    const systemInstruction = `You are the HarNova AI Planner. Based on the user's webpage prompt, propose a highly relevant, customized list of 4 to 5 core layout blocks or section components to build a majestic cohesive single-page website.
Format the output as a JSON array of objects with fields:
- "id": a lowercase identifier (e.g., "hero", "bento-features", "pricing-tier", "testimonials", "calculator", "contact")
- "name": a short catchy human-readable name of the component (e.g., "Neon Feature Grid", "Interactive Savings Portal")
- "desc": a brief description of what this block will contain.

Do NOT output markdown code blocks. Return ONLY valid JSON with a "blocks" array field. Limit output to maximum 5 blocks.`;

    const userPrompt = `Propose specific, customized layout blocks for this webpage topic: "${prompt}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["id", "name", "desc"]
              }
            }
          },
          required: ["blocks"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return res.json(parsed);
  } catch (err) {
    console.warn("Failed to dynamically plan blocks, falling back:", err);
    return res.json({ blocks: defaultBlocks });
  }
});

// AI AGENT: Stream individual layout block generation raw HTML
app.post("/api/agent/generate-block-stream", async (req, res): Promise<any> => {
  const { prompt, blockName, theme, previousBlocksHtml, colorPalette, typography } = req.body;
  if (!prompt || !blockName) {
    return res.status(400).json({ error: "Missing required prompt or blockName." });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const palette = colorPalette || "obsidian";
  const typo = typography || "sans";

  if (!ai) {
    console.log(`Fallback: Streaming custom mock HTML block for [${blockName}] under "${palette}" theme`);
    const mockBlockHtml = getMockBlockHtml(blockName, prompt, theme, palette, typo);
    const chunkSize = 200;
    for (let i = 0; i < mockBlockHtml.length; i += chunkSize) {
      const chunk = mockBlockHtml.substring(i, i + chunkSize);
      res.write(chunk);
      // Simulate real streaming delay
      await new Promise(resolve => setTimeout(resolve, 60));
    }
    return res.end();
  }

  try {
    const systemInstruction = `You are an elite principal front-end designer at HarNova.
Evaluate a single, self-contained, modular HTML component representing "${blockName}" based on the topic: "${prompt}".

AESTHETIC STYLE SPECS:
- Palette: "${palette}" (obsidian, forest, cyberpunk, crimson, arctic, or ocean)
- Font pairs: "${typo}" (serif, sans, mono, rounded)

CRITICAL REQUIREMENTS:
1. Output ONLY the raw inner HTML content representing this single layout block (nested inside <section id="${blockName}" class="...">...</section>).
2. DO NOT include <html>, <head>, <body>, <!DOCTYPE>, or markdown code-block wrapper syntax (do NOT write \`\`\`html or \`\`\`). Output pure markup to stream inline.
3. Use Tailwind utility classes for all spacing, gradients, flex lines, borders, active states, shadows, and spacing.
4. Ensure text contrast is extremely high, and the visual appearance is highly editorial, distinct, and polished.
5. All icons MUST use Lucide HTML structures (e.g. <i data-lucide="zap" class="..."></i>). Do NOT write raw SVGs unless necessary.
6. Make the copy of this element extremely custom and highly targeted to "${prompt}".
${previousBlocksHtml ? `ALIGNMENT CONTEXT: Align your visual structure, grids, and style colors seamlessly with previously compiled sections:\n${previousBlocksHtml.substring(0, 400)}` : ""}`;

    const userPrompt = `Generate the inner responsive HTML component section representing "${blockName}" for the topic: "${prompt}"`;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (error: any) {
    console.error("Agent block stream generation error:", error);
    res.write(`<section class="p-6 bg-red-950/20 border border-red-500/20 rounded-xl mb-6"><h3 class="text-white text-sm font-bold">Block Compile Error</h3><p class="text-xs text-slate-400 mt-1">${error.message || error}</p></section>`);
    res.end();
  }
});

// Helper for high-fidelity fallback block structures
function getMockBlockHtml(blockName: string, prompt: string, theme: string, colorPalette?: string, typography?: string): string {
  const palette = colorPalette || "obsidian";
  const typo = typography || "sans";
  const blockId = blockName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  let bgClass = "bg-slate-900 border border-slate-800";
  let textColor = "text-white";
  let textMuted = "text-slate-400";
  let accentColor = "amber-500";
  let btnClass = "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold";
  let cardClass = "bg-slate-950 border border-slate-850";

  if (palette === "forest") {
    bgClass = "bg-emerald-950/20 border border-emerald-900/10";
    textColor = "text-emerald-950";
    textMuted = "text-emerald-800/70";
    accentColor = "emerald-800";
    btnClass = "bg-emerald-800 text-white font-medium";
    cardClass = "bg-white border border-[#dfdacb]";
  } else if (palette === "cyberpunk") {
    bgClass = "bg-black border border-[rgb(0,240,255)]";
    textColor = "text-[rgb(0,240,255)]";
    textMuted = "text-slate-400 font-mono";
    accentColor = "pink-500";
    btnClass = "bg-[rgb(255,0,127)] text-black uppercase tracking-wider font-bold";
    cardClass = "bg-zinc-950 border border-[rgb(255,0,127)]";
  } else if (palette === "crimson") {
    bgClass = "bg-stone-900 border border-stone-850";
    textColor = "text-stone-100";
    textMuted = "text-stone-400";
    accentColor = "rose-600";
    btnClass = "bg-rose-600 text-white font-semibold";
    cardClass = "bg-zinc-950 border border-stone-800";
  } else if (palette === "arctic") {
    bgClass = "bg-white border border-slate-200 shadow-sm";
    textColor = "text-slate-900";
    textMuted = "text-slate-500";
    accentColor = "sky-600";
    btnClass = "bg-sky-600 text-white font-medium";
    cardClass = "bg-slate-50 border border-slate-150";
  } else if (palette === "ocean") {
    bgClass = "bg-slate-900 border border-slate-800";
    textColor = "text-slate-100";
    textMuted = "text-slate-400";
    accentColor = "teal-500";
    btnClass = "bg-teal-500 text-slate-950 font-bold";
    cardClass = "bg-slate-950 border border-slate-850";
  }

  const roundedClass = typo === "rounded" ? "rounded-3xl" : "rounded-xl";

  if (blockId.includes("hero") || blockId.includes("header") || blockId.includes("banner")) {
    return `
    <section id="${blockId}" class="relative py-16 px-6 ${bgClass} ${roundedClass} overflow-hidden mb-6 flex flex-col items-center text-center">
      <div class="absolute inset-0 bg-radial-at-t from-${accentColor}/5 via-transparent -z-10"></div>
      <div class="inline-flex items-center space-x-1.5 px-3 py-1 ${cardClass} rounded-full text-[10px] text-${accentColor} uppercase font-mono tracking-widest mb-6">
        <span>Agentic Flow Integration</span>
      </div>
      <h2 class="text-3xl font-extrabold tracking-tight ${textColor} mb-4">
        Synthesizing the Future of <span class="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">${prompt}</span>
      </h2>
      <p class="text-xs ${textMuted} max-w-xl mb-6 font-light leading-relaxed">
        Our custom neural-guided static agent module renders a complete web space matching your bespoke topic. Deducting exactly 1 credit for maximum precision.
      </p>
      <div class="flex space-x-3">
        <button class="px-5 py-2.5 ${roundedClass} ${btnClass} text-xs font-semibold hover:opacity-90 transition">Initialize System</button>
        <button class="px-5 py-2.5 ${roundedClass} border border-slate-700 ${textColor} text-xs font-semibold hover:bg-slate-800/20 transition">Learn More</button>
      </div>
    </section>
    `;
  }

  if (blockId.includes("feature") || blockId.includes("grid") || blockId.includes("service") || blockId.includes("bento")) {
    return `
    <section id="${blockId}" class="py-12 px-6 ${bgClass} ${roundedClass} mb-6">
      <h3 class="text-xl font-bold ${textColor} text-center mb-2">Core Solutions Grid</h3>
      <p class="text-xs ${textMuted} text-center mb-8 max-w-md mx-auto">Explore the custom elements planned dynamically by your agent session.</p>
      
      <div class="grid md:grid-cols-3 gap-4">
        <div class="p-6 ${cardClass} ${roundedClass} hover:border-${accentColor}/50 transition">
          <div class="w-8 h-8 rounded bg-${accentColor}/10 flex items-center justify-center text-${accentColor} mb-4"><i data-lucide="zap" class="w-4 h-4"></i></div>
          <h4 class="font-bold text-sm ${textColor} mb-2">Instant Render Engine</h4>
          <p class="text-[11px] ${textMuted} leading-relaxed">Streams complete HTML code components instantly without pipeline latency.</p>
        </div>
        <div class="p-6 ${cardClass} ${roundedClass} hover:border-${accentColor}/50 transition">
          <div class="w-8 h-8 rounded bg-${accentColor}/10 flex items-center justify-center text-${accentColor} mb-4"><i data-lucide="shield" class="w-4 h-4"></i></div>
          <h4 class="font-bold text-sm ${textColor} mb-2">Isolated Sandbox</h4>
          <p class="text-[11px] ${textMuted} leading-relaxed">Each layout block evaluates isolated scripts for optimal runtime stability.</p>
        </div>
        <div class="p-6 ${cardClass} ${roundedClass} hover:border-${accentColor}/50 transition">
          <div class="w-8 h-8 rounded bg-${accentColor}/10 flex items-center justify-center text-${accentColor} mb-4"><i data-lucide="sparkles" class="w-4 h-4"></i></div>
          <h4 class="font-bold text-sm ${textColor} mb-2">Bespoke Copywritten Ads</h4>
          <p class="text-[11px] ${textMuted} leading-relaxed">Deep copywriting localized precisely to the domain of "${prompt}".</p>
        </div>
      </div>
    </section>
    `;
  }

  if (blockId.includes("calculator") || blockId.includes("widget") || blockId.includes("interactive") || blockId.includes("tool")) {
    return `
    <section id="${blockId}" class="py-12 px-6 ${bgClass} ${roundedClass} mb-6">
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span class="text-[9px] font-mono font-bold tracking-wider text-${accentColor} uppercase block mb-1">State Synchronizer</span>
          <h3 class="text-xl font-bold ${textColor} mb-3">Interactive Workspace Panel</h3>
          <p class="text-xs ${textMuted} leading-relaxed">
            Test and convert metrics live using high-fidelity lightweight script routines, embedded directly inside your deployment target page.
          </p>
        </div>
        <div class="p-6 ${cardClass} ${roundedClass} space-y-4">
          <div class="flex justify-between items-center text-xs ${textColor} font-semibold">
            <span>Compiler Fuel Rating</span>
            <span class="text-emerald-400">100% Active</span>
          </div>
          <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-pulse" style="width: 80%"></div>
          </div>
          <div class="flex items-center space-x-2">
            <input type="number" id="widgetInputVal" value="10" class="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none scrollbar-none">
            <button onclick="alert('Multiplier output loaded: ' + document.getElementById('widgetInputVal').value * 22)" class="px-4 py-1.5 ${btnClass} text-xs font-bold rounded">Multiply</button>
          </div>
        </div>
      </div>
    </section>
    `;
  }

  return `
  <section id="${blockId}" class="py-12 px-6 ${bgClass} ${roundedClass} mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
    <div class="max-w-md">
      <h3 class="text-md font-bold ${textColor} mb-1">${blockName}</h3>
      <p class="text-[11px] ${textMuted}">Custom section component generated specifically under the prompt "${prompt}" with 1 token siphoned.</p>
    </div>
    <div class="shrink-0 flex items-center space-x-2">
      <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">1.0 Credit Settled</span>
      <button class="px-4 py-1.5 ${btnClass} rounded text-xs shadow-md">Deploy</button>
    </div>
  </section>
  `;
}

// Mock HTML helper for instant, high-fidelity beautiful generator responses
function getMockHtmlForPrompt(
  prompt: string, 
  theme: string, 
  title: string, 
  colorPalette?: string, 
  typography?: string, 
  layout?: string, 
  activeSections?: string[], 
  efficiencyMode?: string
): string {
  const palette = colorPalette || "obsidian";
  const typo = typography || "sans";
  const lay = layout || "bento";
  const sections = activeSections || ["hero", "features", "calculator", "faq", "contact", "footer"];

  // Colors config Setup
  let bgClass = "bg-slate-950 text-slate-100";
  let cardClass = "bg-slate-900 border border-slate-800";
  let accentColor = "amber-500";
  let accentTeal = "amber-500";
  let btnClass = "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950";
  let textAccentClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  
  if (palette === "forest") {
    bgClass = "bg-[#fcfaf6] text-[#0b2f27]";
    cardClass = "bg-white border border-[#e5dfd3]";
    accentColor = "emerald-800";
    accentTeal = "emerald-600";
    btnClass = "bg-emerald-800 hover:bg-emerald-900 text-white";
    textAccentClass = "text-emerald-800 bg-emerald-50 border-emerald-150";
  } else if (palette === "cyberpunk") {
    bgClass = "bg-black text-[rgb(0,240,255)]";
    cardClass = "bg-zinc-950 border border-[rgb(255,0,127)] shadow-[0_0_10px_rgba(255,0,127,0.15)]";
    accentColor = "[rgb(255,0,127)]";
    accentTeal = "[rgb(0,240,255)]";
    btnClass = "bg-[rgb(255,0,127)] text-black font-semibold tracking-wider uppercase";
    textAccentClass = "text-[rgb(255,0,127)] bg-[rgba(255,0,127,0.05)] border-[rgb(255,0,127)]";
  } else if (palette === "crimson") {
    bgClass = "bg-zinc-950 text-stone-100";
    cardClass = "bg-stone-900/60 border border-stone-800";
    accentColor = "rose-600";
    accentTeal = "rose-500";
    btnClass = "bg-rose-600 hover:bg-rose-500 text-white";
    textAccentClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  } else if (palette === "arctic") {
    bgClass = "bg-slate-50 text-slate-900";
    cardClass = "bg-white border border-slate-200/80 shadow-sm shadow-slate-200/10";
    accentColor = "sky-600";
    accentTeal = "cyan-600";
    btnClass = "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/15";
    textAccentClass = "text-sky-600 bg-sky-50 border-sky-200";
  } else if (palette === "ocean") {
    bgClass = "bg-slate-950 text-slate-100";
    cardClass = "bg-slate-900/90 border border-slate-800";
    accentColor = "teal-500";
    accentTeal = "cyan-400";
    btnClass = "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold hover:opacity-95";
    textAccentClass = "text-teal-400 bg-teal-400/10 border-teal-400/20";
  }

  // Typography imports setup
  let fontLink = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@350;400;500;650&display=swap" rel="stylesheet">';
  let fontSans = "'Inter', sans-serif";
  let fontSerif = "'Inter', sans-serif";
  let fontClass = "font-sans";

  if (typo === "serif") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">';
    fontSans = "'Inter', sans-serif";
    fontSerif = "'Playfair Display', serif";
    fontClass = "font-serif";
  } else if (typo === "sans") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@300;400;650&display=swap" rel="stylesheet">';
    fontSans = "'Inter', sans-serif";
    fontSerif = "'Outfit', sans-serif";
    fontClass = "font-display";
  } else if (typo === "mono") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">';
    fontSans = "'JetBrains Mono', monospace";
    fontSerif = "'JetBrains Mono', monospace";
    fontClass = "font-mono";
  } else if (typo === "rounded") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Comfortaa:wght@400;700&display=swap" rel="stylesheet">';
    fontSans = "'Outfit', sans-serif";
    fontSerif = "'Comfortaa', cursive";
    fontClass = "font-display";
  }

  const roundedClass = typo === "rounded" ? "rounded-3xl" : "rounded-2xl";
  const pillClass = typo === "rounded" ? "rounded-full" : "rounded-lg";

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Created with HarNova</title>
  ${fontLink}
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: [${fontSans.includes("sans-serif") ? "'Inter'" : fontSans}, "sans-serif"],
            serif: [${fontSerif.includes("serif") ? "'Playfair Display'" : fontSerif}, "serif"],
            mono: ["'JetBrains Mono'", "monospace"],
            display: [${typo === 'rounded' ? "'Comfortaa'" : "'Outfit'"}, "sans-serif"]
          }
        }
      }
    }
  </script>
  <style>
    .glass-card {
      backdrop-filter: blur(12px);
    }
  </style>
</head>
<body class="${bgClass} ${fontClass} min-h-screen flex flex-col selection:bg-${accentColor}/20 overflow-x-hidden">

  <!-- Navigation -->
  <header class="border-b ${palette === 'forest' ? 'border-[#eec3b5]/30' : 'border-slate-800/40'} ${palette === 'forest' ? 'bg-[#fcfaf6]/80' : 'bg-slate-950/80'} backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center space-x-3.5">
        <div class="w-10 h-10 ${roundedClass} bg-gradient-to-tr from-${accentColor} to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-${accentColor}/10">
          ${nameAcronym(title)}
        </div>
        <span class="font-bold text-lg tracking-tight hover:opacity-80 cursor-pointer text-${palette === 'forest' ? '[#0b2f27]' : 'slate-100'}">${title}</span>
      </div>
      <nav class="hidden md:flex items-center space-x-8 text-sm font-medium">
        ${sections.includes("features") ? `<a href="#features" class="hover:text-${accentColor} transition">Features</a>` : ""}
        ${sections.includes("calculator") ? `<a href="#calculator" class="hover:text-${accentColor} transition">Interactive Tool</a>` : ""}
        ${sections.includes("faq") ? `<a href="#faq" class="hover:text-${accentColor} transition">FAQs</a>` : ""}
        ${sections.includes("contact") ? `<a href="#contact" class="px-4 py-2 ${pillClass} ${btnClass} shadow-lg shadow-${accentColor}/10 transition-all active:scale-[0.98]">Connect</a>` : ""}
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  ${sections.includes("hero") ? `
  <section class="relative py-24 md:py-32 overflow-hidden flex items-center">
    <div class="absolute inset-0 bg-radial-at-t ${palette === 'forest' ? 'from-emerald-900/5' : 'from-purple-950/20'} via-transparent -z-10"></div>
    <div class="max-w-5xl mx-auto px-6 text-center relative z-10">
      <div class="inline-flex items-center space-x-2 px-3 py-1.5 ${pillClass} ${textAccentClass} border text-xs font-semibold mb-8">
        <span class="flex h-2 w-2 rounded-full bg-${accentColor} animate-pulse"></span>
        <span>HarNova High-Contrast Deployed Node</span>
      </div>
      
      <h1 class="text-4xl sm:text-6xl ${fontSerif.includes("Playfair") ? "font-serif" : "font-display"} font-extrabold tracking-tight mb-8 leading-tight">
        Mastering the Art of <span class="bg-gradient-to-r from-${accentColor} to-pink-500 bg-clip-text text-transparent">${prompt}</span>
      </h1>
      
      <p class="text-base sm:text-lg opacity-85 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        Our tailor-made solution matches exactly your visual parameters. We render robust client matrices, dynamic scripts, and stunning modern utility grids.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#features" class="w-full sm:w-auto px-8 py-4 ${roundedClass} ${btnClass} font-semibold text-sm transition-all hover:scale-[1.02] shadow-xl shadow-${accentColor}/20">
          Explore Features
        </a>
        <a href="#contact" class="w-full sm:w-auto px-8 py-4 ${roundedClass} border ${palette === 'forest' ? 'border-emerald-800/45 text-emerald-800' : 'border-slate-700 text-slate-300'} hover:bg-slate-800/10 font-medium text-sm transition transition-all duration-150">
          Get in Touch
        </a>
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Features Grid -->
  ${sections.includes("features") ? `
  <section id="features" class="py-24 border-t ${palette === 'forest' ? 'border-[#e5dfd3] bg-[#f8fafc]/50' : 'border-slate-900 bg-slate-900/10'}">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl ${fontSerif.includes("Playfair") ? "font-serif font-semibold" : "font-display font-black"} mb-4">Core Architecture Dimensions</h2>
        <p class="text-sm opacity-65">Curating precise pixel schemes, streamlined client loadouts, and modular grid variables.</p>
      </div>

      <div class="${lay === 'bento' ? 'grid md:grid-cols-3 gap-6' : lay === 'sleek_split' ? 'grid md:grid-cols-2 gap-8' : 'space-y-8 max-w-4xl mx-auto'}">
        <div class="p-8 ${roundedClass} ${cardClass} hover:border-${accentColor}/50 transition duration-300 transform hover:-translate-y-1">
          <div class="w-12 h-12 ${roundedClass} bg-${accentColor}/10 flex items-center justify-center mb-6 text-${accentColor}">
            <i data-lucide="zap" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold mb-3">Ultra Responsive Design</h3>
          <p class="text-xs opacity-75 leading-relaxed">Configured to render perfectly on sub-mobile viewpoints as well as huge widescreen media platforms.</p>
        </div>

        <div class="p-8 ${roundedClass} ${cardClass} hover:border-${accentColor}/50 transition duration-300 transform hover:-translate-y-1">
          <div class="w-12 h-12 ${roundedClass} bg-${accentColor}/10 flex items-center justify-center mb-6 text-${accentColor}">
            <i data-lucide="shield" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold mb-3">Sovereign Data Shield</h3>
          <p class="text-xs opacity-75 leading-relaxed">Integrated custom sandbox structures to protect client information parameters and secure forms.</p>
        </div>

        <div class="p-8 ${roundedClass} ${cardClass} hover:border-${accentColor}/50 transition duration-300 transform hover:-translate-y-1 md:col-span-${lay === 'bento' ? '1' : '2'}">
          <div class="w-12 h-12 ${roundedClass} bg-${accentColor}/10 flex items-center justify-center mb-6 text-${accentColor}">
            <i data-lucide="sparkles" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold mb-3">Tailored Palette Synthesis</h3>
          <p class="text-xs opacity-75 leading-relaxed">Constructed visually from your custom parameters to harmonize completely with your design aesthetic.</p>
        </div>
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Interactive Sandbox Widget (Calculator Tool) -->
  ${sections.includes("calculator") ? `
  <section id="calculator" class="py-24 border-t ${palette === 'forest' ? 'border-[#e5dfd3]' : 'border-slate-900'} bg-transparent">
    <div class="max-w-5xl mx-auto px-6">
      <div class="${roundedClass} ${cardClass} p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-80 h-80 bg-${accentColor}/5 rounded-full blur-3xl -z-10"></div>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center space-x-1.5 px-2.5 py-1 ${pillClass} ${textAccentClass} border text-[10px] uppercase tracking-wider font-semibold mb-3">
              <i data-lucide="cpu" class="w-3.5 h-3.5"></i>
              <span>Interactive Simulator</span>
            </div>
            <h2 class="text-3xl ${fontSerif.includes("Playfair") ? "font-serif font-bold" : "font-display font-black"} mb-4">Visual Parameter Calculator</h2>
            <p class="text-xs opacity-70 leading-relaxed mb-6">
              Test live mathematical model outputs directly. Designed to demonstrate fast execution loops embedded within your bespoke static system.
            </p>
            
            <div class="space-y-4 max-w-sm">
              <div class="flex items-center space-x-3">
                <input id="calcInputA" type="number" class="w-24 px-3 py-2.5 ${pillClass} ${palette === 'forest' ? 'bg-white border-[#dfdacb]' : 'bg-slate-950 border-slate-800'} border text-center text-sm focus:outline-none" value="8">
                <span class="text-xl font-bold text-${accentColor}">+</span>
                <input id="calcInputB" type="number" class="w-24 px-3 py-2.5 ${pillClass} ${palette === 'forest' ? 'bg-white border-[#dfdacb]' : 'bg-slate-950 border-slate-800'} border text-center text-sm focus:outline-none" value="14">
                <button onclick="runSampleCalc()" class="px-5 py-2.5 ${pillClass} ${btnClass} font-semibold text-xs active:scale-95 transition-all">Compute</button>
              </div>
              <div class="p-4 ${roundedClass} ${palette === 'forest' ? 'bg-[#f5f1e8]' : 'bg-slate-950'} border border-slate-850/50 text-sm font-semibold flex justify-between items-center">
                <span>Result Output:</span>
                <span id="calcResult" class="text-lg font-black text-${accentColor}">22</span>
              </div>
            </div>
          </div>
          
          <div class="relative flex items-center justify-center">
            <div class="p-6 w-full ${roundedClass} ${palette === 'forest' ? 'bg-[#f5f1e8]' : 'bg-slate-950/80'} border ${palette === 'forest' ? 'border-[#dfdacb]' : 'border-slate-850'} shadow-xl text-center">
              <div class="w-12 h-12 bg-${accentColor}/10 text-${accentColor} rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <i data-lucide="milestone" class="w-6 h-6"></i>
              </div>
              <h4 class="font-bold text-sm mb-1 text-${palette === 'forest' ? '[#0b2f27]' : 'slate-200'}">Client State Engine Active</h4>
              <p class="text-[9px] opacity-50 mb-4 font-mono">STATUS: HIGH_DENSITY_COMPILED</p>
              <div class="h-2 w-full bg-slate-800/40 rounded-full overflow-hidden mb-2">
                <div class="h-full bg-gradient-to-r from-${accentColor} to-pink-500 rounded-full" style="width: 85%"></div>
              </div>
              <span class="text-[10px] opacity-60">Optimized compiler footprint running locally.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  ` : ""}

  <!-- FAQs Section -->
  ${sections.includes("faq") ? `
  <section id="faq" class="py-24 border-t ${palette === 'forest' ? 'border-[#e5dfd3] bg-[#f8fafc]/50' : 'border-slate-900 bg-slate-900/10'}">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl ${fontSerif.includes("Playfair") ? "font-serif font-bold" : "font-display font-black"} mb-4">Frequently Asked Inquiries</h2>
        <p class="text-sm opacity-65">Got outstanding questions? Explore our compiled logic blocks.</p>
      </div>

      <div class="space-y-4">
        <div class="p-5 ${roundedClass} ${cardClass} cursor-pointer" onclick="toggleFaq(1)">
          <div class="flex justify-between items-center">
            <h4 class="text-sm font-bold">How is visual-control compiling optimized?</h4>
            <i data-lucide="chevron-down" id="faqIcon1" class="w-4 h-4 text-${accentColor} transition-transform duration-200"></i>
          </div>
          <p id="faqAns1" class="hidden text-xs opacity-75 mt-3 leading-relaxed">
            By mapping user color palettes, typography specs, and section variables directly onto compiled system modules, avoiding unrequested extra weights and keeping token fuel rates extremely friendly!
          </p>
        </div>

        <div class="p-5 ${roundedClass} ${cardClass} cursor-pointer" onclick="toggleFaq(2)">
          <div class="flex justify-between items-center">
            <h4 class="text-sm font-bold">Can I connect my own custom domains?</h4>
            <i data-lucide="chevron-down" id="faqIcon2" class="w-4 h-4 text-${accentColor} transition-transform duration-200"></i>
          </div>
          <p id="faqAns2" class="hidden text-xs opacity-75 mt-3 leading-relaxed">
            Absolutely! Our built-in HarNova Sovereign Domain Gateway handles custom pointers, enabling instant deployment to client edge servers.
          </p>
        </div>
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Contact Section (Lead capture form) -->
  ${sections.includes("contact") ? `
  <section id="contact" class="py-24 border-t ${palette === 'forest' ? 'border-[#e5dfd3]' : 'border-slate-900'} relative">
    <div class="max-w-xl mx-auto px-6 text-center">
      <h2 class="text-3xl ${fontSerif.includes("Playfair") ? "font-serif font-bold" : "font-display font-black"} mb-4">Connect Securely</h2>
      <p class="text-sm opacity-70 mb-10 leading-relaxed">Let us synthesize customized pipelines tailored to your digital architecture.</p>
      
      <div class="${roundedClass} ${cardClass} p-8 text-left shadow-2xl relative">
        <div id="contactForm">
          <div class="space-y-5">
            <div>
              <label class="block text-[10px] font-semibold opacity-60 uppercase mb-1.5 tracking-wider">Client Identity / Name</label>
              <input type="text" id="contactName" class="w-full px-4 py-3 ${pillClass} ${palette === 'forest' ? 'bg-[#fcfaf6] border-[#dfdacb]' : 'bg-slate-950 border-slate-800'} border text-sm focus:outline-none" placeholder="e.g. Satoshi Nakamoto">
            </div>
            <div>
              <label class="block text-[10px] font-semibold opacity-60 uppercase mb-1.5 tracking-wider">Communication Channel / Email</label>
              <input type="email" id="contactEmail" class="w-full px-4 py-3 ${pillClass} ${palette === 'forest' ? 'bg-[#fcfaf6] border-[#dfdacb]' : 'bg-slate-950 border-slate-800'} border text-sm focus:outline-none" placeholder="e.g. satoshi@gmx.com">
            </div>
            <button onclick="submitContactForm()" class="w-full py-3.5 ${pillClass} ${btnClass} font-bold text-sm tracking-wide transition shadow-lg mt-2">
              Dispatch Request
            </button>
          </div>
        </div>
        
        <div id="contactSuccess" class="hidden text-center py-8">
          <div class="w-16 h-16 rounded-full bg-${accentColor}/15 flex items-center justify-center text-${accentColor} mx-auto mb-4 border border-${accentColor}/25">
            <i data-lucide="check" class="w-8 h-8"></i>
          </div>
          <h4 class="text-lg font-bold mb-1">Transmission Dispatched</h4>
          <p class="text-xs opacity-75">Your parameters have been logged. We will contact you immediately.</p>
        </div>
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Footer Section -->
  ${sections.includes("footer") ? `
  <footer class="mt-auto border-t ${palette === 'forest' ? 'border-[#eec3b5]/30' : 'border-slate-900 bg-slate-950/40'} py-12 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center space-x-3">
        <div class="w-6 h-6 rounded bg-${accentColor} flex items-center justify-center text-slate-950 font-black text-xs">
          ${nameAcronym(title)}
        </div>
        <span class="font-bold text-slate-350">${title}</span>
      </div>
      <span>&copy; 2026 ${title}. Deployed via HarNova Custom Compiler Suite.</span>
    </div>
  </footer>
  ` : ""}

  <script>
    lucide.createIcons();
    
    function runSampleCalc() {
      const a = parseFloat(document.getElementById('calcInputA').value) || 0;
      const b = parseFloat(document.getElementById('calcInputB').value) || 0;
      document.getElementById('calcResult').innerText = String(a + b);
    }

    function toggleFaq(id) {
      const ans = document.getElementById('faqAns' + id);
      const icon = document.getElementById('faqIcon' + id);
      if (ans && icon) {
        ans.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
      }
    }

    function submitContactForm() {
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      if (!name || !email) {
        alert('Please fill out all parameter boxes.');
        return;
      }
      document.getElementById('contactForm').classList.add('hidden');
      document.getElementById('contactSuccess').classList.remove('hidden');
    }
  </script>
</body>
</html>`;
}

function nameAcronym(str: string) {
  return str.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// Vite integration & route fallbacks
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from compiled dist folder in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.all('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HarNova SaaS Webserver is live and listening on http://localhost:${PORT}`);
  });
};

startServer();
