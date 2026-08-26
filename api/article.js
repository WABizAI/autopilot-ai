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

    /*
    =========================================================
    STEP 1 — PROFESSIONAL SEO ARTICLE
    =========================================================
    */

    const articlePrompt = `
You are AutoPilot AI, an elite SEO strategist, professional
editor, content writer and digital marketing expert.

Create a completely publication-ready article.

TARGET KEYWORD:
${cleanKeyword}

LANGUAGE:
${language}

TONE:
${tone}

IMPORTANT:

Write a genuinely useful article for real readers.

DO NOT mention:
- AI
- Gemini
- prompts
- content generation
- this instruction
- being an AI

The article must feel professionally written by an experienced
human SEO writer.

SEO REQUIREMENTS:

1. Create an attractive SEO title.
2. Title should naturally include the primary keyword.
3. Meta description must be 140-160 characters.
4. Create an SEO-friendly URL slug.
5. Provide one focus keyword.
6. Provide 8-12 secondary keywords.
7. Identify search intent.
8. Write a compelling introduction.
9. Create multiple H2 sections.
10. Add H3 subsections where useful.
11. Use short readable paragraphs.
12. Use bullet lists where useful.
13. Use numbered lists where useful.
14. Naturally include semantic keywords.
15. Avoid keyword stuffing.
16. Add practical examples.
17. Add an FAQ section.
18. Add a strong conclusion.
19. Create a professional featured-image prompt.
20. Target approximately 1800-2500 words.
21. Never invent statistics.
22. Never make unsupported factual claims.
23. Make the article useful enough to publish directly.

STRUCTURE:

SEO INFORMATION
- title
- metaDescription
- slug
- focusKeyword
- secondaryKeywords
- searchIntent
- excerpt

ARTICLE
- introduction
- sections
- faq
- conclusion

IMAGE
- imagePrompt

For every H2 section:

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

IMPORTANT:
Return JSON only.
Do not wrap JSON in markdown.
Do not use ###, ##, ** or ---.
Do not put markdown heading symbols inside the content.

RETURN EXACTLY THIS JSON STRUCTURE:

{
  "title": "",
  "metaDescription": "",
  "slug": "",
  "focusKeyword": "",
  "secondaryKeywords": [],
  "searchIntent": "",
  "excerpt": "",
  "introduction": "",
  "sections": [],
  "faq": [],
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
            maxOutputTokens: 12000,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const articleData = await articleResponse.json();

    if (!articleResponse.ok) {
      console.error("ARTICLE GEMINI ERROR:", articleData);

      return res.status(articleResponse.status).json({
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
    } catch (error) {
      console.error("ARTICLE JSON ERROR:", error);
      console.error("RAW RESPONSE:", articleText);

      return res.status(502).json({
        error: "AI returned invalid article data."
      });
    }

    /*
    =========================================================
    STEP 2 — PROFESSIONAL FEATURED IMAGE
    =========================================================
    */

    let image = null;

    const imagePrompt =
      article.imagePrompt ||
      `
Create a premium professional editorial featured image
for a business website article.

Topic:
${cleanKeyword}

Article title:
${article.title || cleanKeyword}

Style:
- modern
- premium
- realistic
- professional
- editorial
- clean composition
- high-end business publication
- visually relevant to the topic
- strong depth
- professional lighting
- suitable for a blog featured image

Aspect ratio:
16:9

Do not include:
- logos
- watermark
- random text
- distorted objects
- unnecessary UI
`;

    try {
      const imageResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent?key=" +
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
              responseModalities: ["TEXT", "IMAGE"],
              responseFormat: {
                image: {
                  aspectRatio: "16:9",
                  imageSize: "1K"
                }
              }
            }
          })
        }
      );

      const imageData = await imageResponse.json();

      if (!imageResponse.ok) {
        console.error(
          "IMAGE GENERATION ERROR:",
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
        }
      }
    } catch (imageError) {
      console.error(
        "IMAGE GENERATION FAILED:",
        imageError
      );
    }

    /*
    =========================================================
    STEP 3 — WORD COUNT
    =========================================================
    */

    const allText = [
      article.introduction || "",
      ...(article.sections || []).flatMap((section) => [
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
      ]),
      ...(article.faq || []).flatMap((item) => [
        item.question || "",
        item.answer || ""
      ]),
      article.conclusion || ""
    ].join(" ");

    const calculatedWordCount =
      allText
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    /*
    =========================================================
    STEP 4 — FINAL RESPONSE
    =========================================================
    */

    return res.status(200).json({
      success: true,

      article: {
        ...article,
        wordCount:
          calculatedWordCount || article.wordCount || 0
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
