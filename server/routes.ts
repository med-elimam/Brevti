import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import multer from "multer";
import * as pdfParse from "pdf-parse";
import OpenAI from "openai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

function normalizeText(input: string): string {
  return input
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true });
  });

  // 1) Upload PDF -> Extract text (field name: file)
  app.post("/api/pdf/extract", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "Missing PDF file (field: file)" });

      const mimeOk =
        file.mimetype === "application/pdf" ||
        file.originalname.toLowerCase().endsWith(".pdf");

      if (!mimeOk) return res.status(400).json({ message: "File is not a PDF" });

      const data = await (pdfParse as any)(file.buffer);
      const text = normalizeText(data.text || "");

      if (!text) {
        return res.status(422).json({
          message: "No extractable text found in this PDF (maybe scanned images).",
        });
      }

      return res.status(200).json({
        filename: file.originalname,
        pages: data.numpages ?? null,
        text,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "PDF extraction failed" });
    }
  });

  // 2) QA using OpenAI directly (Arabic/French)
  app.post("/api/pdf/qa", async (req: Request, res: Response) => {
    try {
      const { question, contextText, answerLang } = req.body as {
        question?: string;
        contextText?: string;
        answerLang?: "ar" | "fr";
      };

      if (!question || !contextText) {
        return res.status(400).json({ message: "Missing question or contextText" });
      }
      if (answerLang !== "ar" && answerLang !== "fr") {
        return res.status(400).json({ message: "answerLang must be 'ar' or 'fr'" });
      }

      const apiKey = requireEnv("OPENAI_API_KEY");
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini-2024-07-18";

      const client = new OpenAI({ apiKey });

      const system =
        answerLang === "fr"
          ? "Tu réponds en français. Réponse claire, directe, et basée uniquement sur le texte fourni. Si l'info n'existe pas dans le texte, dis: 'Information non trouvée dans le document.'"
          : "أجب بالعربية فقط. جواب واضح ومباشر ومبني فقط على النص المُعطى. إذا المعلومة غير موجودة في النص قل: 'المعلومة غير موجودة في الوثيقة.'";

      const response = await client.responses.create({
        model,
        input: [
          { role: "system", content: system },
          {
            role: "user",
            content:
              "DOCUMENT:\n" +
              contextText +
              "\n\nQUESTION:\n" +
              question +
              "\n\nRULES:\n- Use only the document.\n- If not found, say exactly the not-found sentence from system.\n",
          },
        ],
      });

      // Node SDK يعطيك النص النهائي بهذه الخاصية غالباً
      const answer = (response as any).output_text ?? "";

      return res.status(200).json({ answer });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "QA failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}