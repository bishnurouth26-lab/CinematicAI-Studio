import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/admin/analytics", (req, res) => {
    // Generate realistic system health and analytics stats
    res.json({
      activeUsers: 45231,
      generations24h: 128400,
      uptime: 99.98,
      apiLimitUse: 64,
      trends: [
        { topic: 'AI Productivity Tips', change: '+24%', vol: 'High' },
        { topic: 'Faceless True Crime', change: '+18%', vol: 'Very High' },
        { topic: 'Budget Tech Reviews', change: '+12%', vol: 'Medium' }
      ]
    });
  });

  app.get("/api/ai/memory", (req, res) => {
    // Generate adaptive learning profile logic
    res.json({
      styleMemory: {
        tone: 'Documentary, Authoritative, Hindi',
        visuals: 'Dark Cinematic, High Contrast (Neon Blue/Purple)',
        pacing: 'Fast hooks (3s), 8s body scenes',
        model: 'Gemini 3.1 Pro (85% usage)'
      },
      recommendations: [
        { type: 'hook', title: 'Hook Refinement Detected', desc: 'Your recent "Sci-Fi" scripts have a slow start. The AI will now auto-append "Start with a jarring question" to your prompts.' },
        { type: 'seo', title: 'SEO Title Optimization', desc: 'Your titles are lacking emotional trigger words. "Terrifying" and "Secret" will be prioritized in SEO generation.' }
      ],
      behavioral: {
        mostUsed: [
          { name: 'Scripts', val: 78, color: 'bg-fuchsia-500' },
          { name: 'Thumbnails', val: 65, color: 'bg-blue-500' },
          { name: 'Scene Prompts', val: 42, color: 'bg-emerald-500' }
        ],
        habits: [
          'Generates Script, directly moves to Prompts.',
          'Frequent regeneration of Thumbnails (avg 3x).',
          'Exports as ZIP with Markdown formatting.'
        ]
      }
    });
  });

  // Example proxy endpoint for Gemini
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      
      const generateWithRetry = async (retries = 3): Promise<any> => {
        try {
          return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || "You are an expert AI assistant for YouTubers and Content Creators.",
            }
          });
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          if (retries > 0 && (err?.status === 503 || errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429'))) {
            console.log(`Rate limit or 503 received, retrying... (${retries} attempts left)`);
            await new Promise(r => setTimeout(r, 2000));
            return generateWithRetry(retries - 1);
          }
          throw err;
        }
      };

      const response = await generateWithRetry();

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errMsg = error?.message || String(error);
      if (error?.status === 429 || error?.code === 429 || errMsg.includes('429')) {
        return res.status(429).json({ error: "API rate limit exceeded. Please try again in a few seconds." });
      }
      if (error?.status === 503 || error?.code === 503 || errMsg.includes('503') || errMsg.includes('UNAVAILABLE')) {
        return res.status(503).json({ error: "The AI model is currently experiencing high demand. Please try again in a moment." });
      }
      res.status(500).json({ error: errMsg || "An unexpected error occurred." });
    }
  });

  // Video generation endpoints (Veo)
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt } = req.body;
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '9:16'
        }
      });
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Video Generation Start Error:", error);
      res.status(500).json({ error: error.message || "Failed to start video generation." });
    }
  });

  // It's required to import GenerateVideosOperation for the status and download
  app.post("/api/video-status", async (req, res) => {
    try {
      const { GenerateVideosOperation } = await import("@google/genai");
      const op = new GenerateVideosOperation();
      op.name = req.body.operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done });
    } catch (error: any) {
      console.error("Video Generation Polling Error:", error);
      res.status(500).json({ error: error.message || "Failed to poll video generation." });
    }
  });

  app.post("/api/video-download", async (req, res) => {
    try {
      const { GenerateVideosOperation } = await import("@google/genai");
      const op = new GenerateVideosOperation();
      op.name = req.body.operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "Video URI not found." });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video: ${videoRes.statusText}`);
      }

      res.setHeader('Content-Type', 'video/mp4');
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("Video Generation Download Error:", error);
      res.status(500).json({ error: error.message || "Failed to download video." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch(e) {
      console.log('Vite not found, assuming production static.');
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.VERCEL) {
    // Vercel serverless function execution
    return app;
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Support for standard node execution
if (!process.env.VERCEL) {
  startServer();
}

// Export for Vercel
export default startServer();
