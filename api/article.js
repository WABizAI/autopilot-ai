import { InferenceClient } from "@huggingface/inference";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      keyword,
      language = "English",
      tone = "Professional"
    } = req.body || {};

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        error: "Please enter a target keyword."
      });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const hfToken = process.env.HF_TOKEN;

    if (!geminiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured."
      });
    }

    if (!hfToken) {
      return res.status(500).json({
        error: "HF_TOKEN is not configured."
      });
    }

    const cleanKeyword = keyword.trim();

    // =====================================================
    // STEP 1 — PROFESSIONAL SEO ARTICLE
    // =====================================================

    const articlePrompt = `
You are an elite SEO strategist, professional editor,
research-minded content writer and digital publishing expert.

Create a publication-ready article that feels like it was
written by an experienced professional human writer.

TARGET KEYWORD:
${cleanKeyword}

LANGUAGE:
${language}

TONE:
${tone}

WRITING QUALITY:

- Write genuinely useful content for real readers.
- Clearly satisfy the search intent.
- Explain concepts instead of making vague statements.
- Use natural human writing.
- Use varied sentence structures.
- Avoid repetitive wording.
- Avoid generic filler.
- Avoid unnecessary introductions.
- Avoid repeating the same information.
- Use specific examples where useful.
- Give actionable advice.
- Maintain a professional editorial standard.
- Use natural transitions between sections.
- Give practical information instead of generic statements.

DO NOT mention:

- AI
- Gemini
- prompts
- content generation
- language models
- these instructions
- being an AI
- AutoPilot AI

Do not invent statistics.
Do not create fake studies.
Do not invent citations.
Do not make unsupported factual claims.

SEO REQUIREMENTS:

1. Create an attractive SEO title.
2. Include the primary keyword naturally.
3. Create a 140-160 character meta description.
4. Create a clean SEO-friendly slug.
5. Provide one focus keyword.
6. Provide 8-12 secondary keywords.
7. Identify the search intent.
8. Write a strong introduction.
9. Create 6-8 detailed H2 sections.
10. Add useful H3 subsections.
11. Use semantic keywords naturally.
12. Avoid keyword stuffing.
13. Include practical examples.
14. Include actionable recommendations.
15. Include bullet lists where useful.
16. Include numbered lists where useful.
17. Include exactly 6 useful FAQ questions.
18. Write a strong conclusion.
19. Create a detailed professional image prompt.
20. Target approximately 1800-2500 words.

ARTICLE QUALITY:

The introduction must:

- Clearly explain the topic.
- Address the reader's problem.
- Explain what the reader will learn.
- Naturally include the primary keyword.

Each H2 section must contain:

- A meaningful heading.
- Multiple useful paragraphs.
- Practical information.
- Examples where appropriate.
- Bullets or numbered points where useful.
- H3 subsections where useful.

Do not create empty sections.
Do not create filler content.
Do not repeat the same information across sections.

FAQ:

Create exactly 6 useful questions and detailed answers.

IMAGE PROMPT:

Create a detailed professional image-generation prompt
based on the actual article topic.

The image prompt should describe:

- subject
- environment
- composition
- lighting
- visual style
- important objects
- mood
- perspective

Do NOT include:

- text
- logos
- watermarks
- titles
- UI elements

inside the image.

RETURN JSON ONLY.

Use EXACTLY this structure:

{
  "title": "",
  "metaDescription": "",
  "slug": "",
  "focusKeyword": "",
  "secondaryKeywords": [],
  "searchIntent": "",
  "excerpt": "",
  "introduction": "",
  "sections": [
    {
      "heading": "",
      "level": 2,
      "paragraphs": [],
      "bullets": [],
      "subsections": [
        {
          "heading": "",
          "level": 3,
          "paragraphs": [],
          "bullets": []
        }
      ]
    }
  ],
  "faq": [
    {
      "question": "",
      "answer": ""
    }
  ],
  "conclusion": "",
  "imagePrompt": "",
  "wordCount": 0
}
`;

    console.log("Starting article generation...");

    // =====================================================
    // GEMINI ARTICLE REQUEST
    // =====================================================

    const articleResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
        encodeURIComponent(geminiKey),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: articlePrompt
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.55,
            maxOutputTokens: 16000,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const articleData = await articleResponse.json();

    if (!articleResponse.ok) {
      console.error(
        "ARTICLE GEMINI ERROR:",
        articleData
      );

      return res.status(500).json({
        error:
          articleData?.error?.message ||
          "Article generation failed."
      });
    }

    // =====================================================
    // EXTRACT ARTICLE
    // =====================================================

    const articleText =
      articleData?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("") || "";

    if (!articleText) {
      return res.status(502).json({
        error: "AI returned an empty article."
      });
    }

    // =====================================================
    // PARSE JSON
    // =====================================================

    let article;

    try {
      article = JSON.parse(articleText);
    } catch (jsonError) {
      console.error(
        "ARTICLE JSON PARSE ERROR:",
        jsonError
      );

      console.error(
        "RAW ARTICLE RESPONSE:",
        articleText
      );

      return res.status(502).json({
        error: "AI returned invalid article JSON."
      });
    }

    // =====================================================
    // STEP 2 — HUGGING FACE IMAGE
    // =====================================================

    let image = null;

    const imagePrompt =
      article.imagePrompt ||
      `
Create a premium professional editorial featured image.

Article topic:
${cleanKeyword}

Article title:
${article.title || cleanKeyword}

Create a visually compelling scene that directly represents
the article topic.

Style:
- photorealistic
- premium editorial photography
- modern
- sophisticated
- professional
- natural cinematic lighting
- realistic materials
- realistic depth
- strong composition
- high-end publication quality

Composition:
- wide landscape composition
- clear main subject
- strong visual hierarchy
- professional camera perspective
- natural depth of field
- balanced composition

Mood:
- professional
- trustworthy
- modern
- visually engaging

Do NOT include:
- text
- letters
- words
- logos
- brand names
- watermarks
- UI
- screenshots
- fake interfaces
- distorted objects
- duplicated objects
`;

    try {
      console.log(
        "Starting Hugging Face image generation..."
      );

      // ===================================================
      // HUGGING FACE CLIENT
      // ===================================================

      const hf = new InferenceClient(hfToken, {
  provider: "fal-ai"
});

      console.log(
        "HF provider: fal-ai"
      );

      console.log(
        "HF model: black-forest-labs/FLUX.1-dev"
      );

      // ===================================================
      // IMAGE GENERATION
      // ===================================================

      const generatedImage =
        await hf.textToImage(
          {
            model:
              "black-forest-labs/FLUX.1-dev",

            inputs:
              imagePrompt,

            parameters: {
              width: 1344,
              height: 768,
              num_inference_steps: 4
            }
          },
          {
            outputType: "blob"
          }
        );

      // ===================================================
      // CONVERT BLOB → BASE64
      // ===================================================

      const imageBuffer =
        Buffer.from(
          await generatedImage.arrayBuffer()
        );

      if (imageBuffer.length > 0) {
        image = {
          mimeType:
            generatedImage.type ||
            "image/png",

          data:
            imageBuffer.toString("base64")
        };

        console.log(
          "HUGGING FACE IMAGE GENERATED SUCCESSFULLY"
        );

        console.log(
          "IMAGE MIME TYPE:",
          image.mimeType
        );

        console.log(
          "IMAGE SIZE:",
          imageBuffer.length
        );
      } else {
        console.error(
          "HUGGING FACE RETURNED EMPTY IMAGE"
        );
      }

    } catch (imageError) {

      console.error(
        "HUGGING FACE IMAGE GENERATION FAILED:"
      );

      console.error(
        imageError?.message ||
        imageError
      );

      if (imageError?.response) {
        console.error(
          "HF ERROR RESPONSE:",
          imageError.response
        );
      }
    }

    // =====================================================
    // STEP 3 — WORD COUNT
    // =====================================================

    const allText = [
      article.introduction || "",

      ...(Array.isArray(article.sections)
        ? article.sections.flatMap(
            (section) => [
              section.heading || "",

              ...(Array.isArray(section.paragraphs)
                ? section.paragraphs
                : []),

              ...(Array.isArray(section.bullets)
                ? section.bullets
                : []),

              ...(Array.isArray(section.subsections)
                ? section.subsections.flatMap(
                    (subsection) => [
                      subsection.heading || "",

                      ...(Array.isArray(
                        subsection.paragraphs
                      )
                        ? subsection.paragraphs
                        : []),

                      ...(Array.isArray(
                        subsection.bullets
                      )
                        ? subsection.bullets
                        : [])
                    ]
                  )
                : [])
            ]
          )
        : []),

      ...(Array.isArray(article.faq)
        ? article.faq.flatMap(
            (item) => [
              item.question || "",
              item.answer || ""
            ]
          )
        : []),

      article.conclusion || ""
    ].join(" ");

    const calculatedWordCount =
      allText
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    // =====================================================
    // STEP 4 — FINAL RESPONSE
    // =====================================================

    console.log(
      "FINAL IMAGE AVAILABLE:",
      Boolean(image)
    );

    return res.status(200).json({
      success: true,

      article: {
        ...article,

        wordCount:
          calculatedWordCount ||
          article.wordCount ||
          0
      },

      image,

      imageUrl: image
        ? `data:${image.mimeType};base64,${image.data}`
        : null
    });

  } catch (error) {

    console.error(
      "ARTICLE API ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Something went wrong while generating the article."
    });
  }
}
