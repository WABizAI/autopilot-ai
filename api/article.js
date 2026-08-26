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
      tone = "Professional",
      audience = "General audience",
      length = "Long"
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

    /* =====================================================
       STEP 1 — ARTICLE
    ===================================================== */

    const articlePrompt = `
You are AutoPilot AI, an elite SEO strategist, professional
editor and expert content writer.

Create a publication-ready article.

TARGET KEYWORD:
${cleanKeyword}

LANGUAGE:
${language}

AUDIENCE:
${audience}

TONE:
${tone}

ARTICLE LENGTH:
${length}

IMPORTANT:

Write genuinely useful content for real readers.

Do not mention:
- AI
- Gemini
- prompts
- content generation
- these instructions

The article should feel professionally written by an
experienced human writer.

SEO REQUIREMENTS:

1. Attractive SEO title.
2. Include the primary keyword naturally.
3. Meta description 140-160 characters.
4. SEO-friendly URL slug.
5. Focus keyword.
6. 8-12 secondary keywords.
7. Search intent.
8. Compelling introduction.
9. Multiple H2 sections.
10. H3 subsections where useful.
11. Short readable paragraphs.
12. Useful bullet lists.
13. Useful numbered lists.
14. Semantic keywords.
15. No keyword stuffing.
16. Practical examples.
17. FAQ section.
18. Strong conclusion.
19. Professional featured-image prompt.
20. Never invent statistics.
21. Never make unsupported factual claims.

Return JSON only.

EXACT JSON:

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

    const articleData =
      await articleResponse.json();

    if (!articleResponse.ok) {
      console.error(
        "ARTICLE GEMINI ERROR:",
        articleData
      );

      return res.status(
        articleResponse.status
      ).json({
        error:
          articleData?.error?.message ||
          "Article generation failed."
      });
    }

    const articleText =
      articleData?.candidates?.[0]
        ?.content?.parts
        ?.map(
          (part) => part.text || ""
        )
        .join("") || "";

    if (!articleText) {
      return res.status(502).json({
        error:
          "AI returned an empty article."
      });
    }

    let article;

    try {
      article =
        JSON.parse(articleText);
    } catch (error) {
      console.error(
        "ARTICLE JSON ERROR:",
        error
      );

      console.error(
        "RAW RESPONSE:",
        articleText
      );

      return res.status(502).json({
        error:
          "AI returned invalid article data."
      });
    }

    /* =====================================================
       STEP 2 — IMAGE GENERATION
    ===================================================== */

    let image = null;

    const imagePrompt =
      article.imagePrompt ||
      `
Create a premium editorial featured image
for a professional business blog.

Topic:
${cleanKeyword}

Article title:
${article.title || cleanKeyword}

Visual direction:

- premium
- realistic
- modern
- professional
- editorial photography
- clean composition
- sophisticated lighting
- strong visual hierarchy
- relevant objects and environment
- high-end business publication quality
- visually interesting
- no unnecessary text

The image must visually represent the article topic.

Do not include:

- logos
- watermarks
- random text
- UI screenshots
- distorted objects
- fake brand logos

Landscape blog featured image.
16:9 composition.
`;

    console.log(
      "Starting AI image generation..."
    );

    try {
      /*
       * IMPORTANT:
       *
       * Use v1beta instead of v1.
       * Gemini 3.1 Flash Image supports
       * 16:9 and imageSize.
       */

      const imageResponse =
        await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=" +
            encodeURIComponent(apiKey),
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
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
        );

      const imageData =
        await imageResponse.json();

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
          imageData?.candidates?.[0]
            ?.content?.parts || [];

        console.log(
          "IMAGE RESPONSE PARTS:",
          parts.length
        );

        const imagePart =
          parts.find(
            (part) =>
              part?.inlineData?.data
          );

        if (imagePart) {
          image = {
            mimeType:
              imagePart
                ?.inlineData
                ?.mimeType ||
              "image/png",

            data:
              imagePart
                ?.inlineData
                ?.data
          };

          console.log(
            "AI IMAGE GENERATED SUCCESSFULLY."
          );
        } else {
          console.error(
            "IMAGE PART NOT FOUND."
          );

          console.error(
            "IMAGE RESPONSE:",
            JSON.stringify(
              imageData
            ).slice(0, 5000)
          );
        }
      }
    } catch (imageError) {
      console.error(
        "IMAGE GENERATION FAILED:",
        imageError
      );
    }

    /* =====================================================
       STEP 3 — WORD COUNT
    ===================================================== */

    const allText = [
      article.introduction || "",

      ...(article.sections || [])
        .flatMap(
          (section) => [
            section.heading || "",

            ...(section.paragraphs || []),

            ...(section.bullets || []),

            ...(section.subsections || [])
              .flatMap(
                (subsection) => [
                  subsection.heading ||
                    "",

                  ...(subsection.paragraphs ||
                    []),

                  ...(subsection.bullets ||
                    [])
                ]
              )
          ]
        ),

      ...(article.faq || [])
        .flatMap(
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

    /* =====================================================
       STEP 4 — FINAL RESPONSE
    ===================================================== */

    const imageUrl = image
      ? `data:${image.mimeType};base64,${image.data}`
      : null;

    console.log(
      "FINAL IMAGE AVAILABLE:",
      Boolean(imageUrl)
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

      imageUrl
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
