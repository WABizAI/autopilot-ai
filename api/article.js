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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured."
      });
    }

    const cleanKeyword = keyword.trim();

    // =====================================================
    // STEP 1 — ARTICLE GENERATION
    // =====================================================

    const articlePrompt = `
You are AutoPilot AI, a professional SEO content strategist,
editor and human-quality article writer.

Create a publication-ready SEO article about:

TARGET KEYWORD:
${cleanKeyword}

LANGUAGE:
${language}

TONE:
${tone}

IMPORTANT WRITING RULES:

- Write for real human readers.
- Make the article genuinely useful and actionable.
- Do not mention AI, Gemini, prompts, content generation,
  or these instructions.
- Do not use fake statistics.
- Do not invent sources or facts.
- Avoid keyword stuffing.
- Use natural semantic keywords.
- Use clear, professional language.
- Make the article feel like it was written by an experienced
  professional editor.

ARTICLE REQUIREMENTS:

1. Create a strong SEO title containing the primary keyword.
2. Create a meta description between 140 and 160 characters.
3. Create a clean SEO URL slug.
4. Provide one focus keyword.
5. Provide 8-12 secondary keywords.
6. Identify search intent.
7. Write a strong introduction.
8. Create 6-8 detailed H2 sections.
9. Add H3 subsections where useful.
10. Each major section must contain useful paragraphs.
11. Use bullet lists where useful.
12. Use numbered lists where useful.
13. Include practical examples.
14. Include actionable advice.
15. Include an FAQ section with 6 questions.
16. Write a useful conclusion.
17. Create a professional featured-image prompt.
18. Target approximately 1800-2500 words.

IMPORTANT:
Every section must contain real content.

Do NOT create empty arrays just to fill the structure.

Return JSON only.

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

    const articleResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
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
    // STEP 2 — FEATURED IMAGE GENERATION
    // =====================================================

    let image = null;

    const imagePrompt =
      article.imagePrompt ||
      `
Create a premium editorial featured image for a professional
business article.

Topic:
${cleanKeyword}

Article title:
${article.title || cleanKeyword}

Visual style:

- premium
- realistic
- modern
- professional
- editorial
- sophisticated
- clean composition
- cinematic lighting
- high visual quality
- suitable for a professional blog
- visually connected to the article topic

Do not include:

- logos
- watermarks
- random text
- distorted objects
- unnecessary interface elements

Create a wide professional blog featured image.
`;

    try {
      console.log("Starting AI image generation...");

      const imageResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=" +
          encodeURIComponent(apiKey),
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
                    text: imagePrompt
                  }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ["IMAGE"]
            }
          })
        }
      );

      const imageData = await imageResponse.json();

      if (!imageResponse.ok) {
        console.error(
          "IMAGE API ERROR STATUS:",
          imageResponse.status
        );

        console.error(
          "IMAGE API ERROR:",
          imageData
        );
      } else {
        const parts =
          imageData?.candidates?.[0]?.content?.parts || [];

        const imagePart = parts.find(
          (part) =>
            part?.inlineData?.data
        );

        if (imagePart) {
          image = {
            mimeType:
              imagePart.inlineData.mimeType ||
              "image/png",

            data:
              imagePart.inlineData.data
          };

          console.log(
            "IMAGE GENERATED SUCCESSFULLY"
          );
        } else {
          console.error(
            "IMAGE API RETURNED NO IMAGE DATA"
          );
        }
      }
    } catch (imageError) {
      console.error(
        "IMAGE GENERATION FAILED:",
        imageError
      );
    }

    // =====================================================
    // STEP 3 — WORD COUNT
    // =====================================================

    const allText = [
      article.introduction || "",

      ...(article.sections || []).flatMap(
        (section) => [
          section.heading || "",
          ...(section.paragraphs || []),
          ...(section.bullets || []),

          ...(section.subsections || []).flatMap(
            (subsection) => [
              subsection.heading || "",
              ...(subsection.paragraphs || []),
              ...(subsection.bullets || [])
            ]
          )
        ]
      ),

      ...(article.faq || []).flatMap(
        (item) => [
          item.question || "",
          item.answer || ""
        ]
      ),

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
