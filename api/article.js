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
You are AutoPilot AI, an elite SEO strategist,
professional editor, research-minded content writer,
and digital publishing expert.

Your job is to create a publication-ready article that
looks and reads like it was written by a highly experienced
human writer.

TARGET KEYWORD:
${cleanKeyword}

LANGUAGE:
${language}

TONE:
${tone}

=====================================================
WRITING QUALITY
=====================================================

The article must:

- Be genuinely useful to the reader.
- Answer the user's search intent clearly.
- Provide practical information.
- Explain concepts instead of making vague statements.
- Use natural human writing.
- Use varied sentence structures.
- Avoid repetitive wording.
- Avoid generic filler.
- Avoid unnecessary introductions.
- Avoid repeating the same idea in different sections.
- Use specific examples where useful.
- Give actionable advice.
- Maintain a professional editorial standard.

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

=====================================================
SEO REQUIREMENTS
=====================================================

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
17. Include a detailed FAQ section.
18. Write a strong conclusion.
19. Create a detailed professional image prompt.
20. Target approximately 1800-2500 words.

=====================================================
ARTICLE STRUCTURE
=====================================================

The introduction should:

- Clearly explain the topic.
- Address the reader's problem.
- Tell the reader what they will learn.
- Naturally include the primary keyword.

Each H2 section must contain:

- A meaningful heading.
- Multiple useful paragraphs.
- Practical information.
- Bullets or numbered points where appropriate.
- H3 subsections where they genuinely improve readability.

Do not create empty sections.

Do not create empty arrays unless there is genuinely
nothing appropriate to include.

FAQ:

Create exactly 6 useful questions and detailed answers.

IMAGE PROMPT:

Create a detailed image-generation prompt based on the
actual article topic.

The image prompt must describe:

- subject
- environment
- composition
- lighting
- visual style
- important objects
- mood
- perspective

Do NOT ask the image model to put text, logos,
watermarks, titles or UI elements inside the image.

=====================================================
RETURN JSON ONLY
=====================================================

Return valid JSON.

Do not use markdown.

Do not use code fences.

Do not add explanations before or after JSON.

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

    const articleText =
      articleData?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("") || "";

    if (!articleText) {
      return res.status(502).json({
        error: "AI returned an empty article."
      });
    }

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
    // STEP 2 — HUGGING FACE FEATURED IMAGE
    // =====================================================

    let image = null;

    const imagePrompt =
      article.imagePrompt ||
      `
Create a premium professional editorial photograph
for a high-quality online article.

Article topic:
${cleanKeyword}

Article title:
${article.title || cleanKeyword}

Create a visually compelling scene that directly
represents the article topic.

Style:

- photorealistic
- premium editorial photography
- modern
- sophisticated
- professional
- cinematic but natural lighting
- realistic materials
- realistic depth
- strong composition
- visually balanced
- high-end business publication quality

Composition:

- wide landscape composition
- clear main subject
- strong visual hierarchy
- natural depth of field
- professional camera perspective
- enough clean space around the main subject

Important:

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
- extra fingers
- duplicated objects

The final image should look suitable as the featured
image of a premium professional blog article.
`;

    try {
      console.log(
        "Starting Hugging Face image generation..."
      );

      const hfResponse = await fetch(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: imagePrompt
          })
        }
      );

      if (!hfResponse.ok) {
        const errorText = await hfResponse.text();

        console.error(
          "HUGGING FACE IMAGE API ERROR STATUS:",
          hfResponse.status
        );

        console.error(
          "HUGGING FACE IMAGE API ERROR:",
          errorText
        );
      } else {
        const contentType =
          hfResponse.headers.get("content-type") ||
          "image/png";

        const imageBuffer = Buffer.from(
          await hfResponse.arrayBuffer()
        );

        if (imageBuffer.length > 0) {
          image = {
            mimeType: contentType,
            data: imageBuffer.toString("base64")
          };

          console.log(
            "HUGGING FACE IMAGE GENERATED SUCCESSFULLY"
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
      }
    } catch (imageError) {
      console.error(
        "HUGGING FACE IMAGE GENERATION FAILED:",
        imageError
      );
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
