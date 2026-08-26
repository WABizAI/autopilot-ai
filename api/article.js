export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { keyword, language = "English", tone = "Professional" } =
      req.body || {};

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

    /*
     * ============================
     * STEP 1 — GENERATE ARTICLE
     * ============================
     */

    const articlePrompt = `
You are AutoPilot AI, an advanced professional SEO content strategist.

Create a high-quality, publication-ready SEO article.

TARGET KEYWORD:
${keyword}

LANGUAGE:
${language}

TONE:
${tone}

IMPORTANT REQUIREMENTS:

1. Write like a professional human writer.
2. Do NOT mention AI, Gemini, prompts, or content generation.
3. Do NOT use markdown symbols such as ###, **, ## or ---.
4. Return clean structured JSON only.
5. Create a strong SEO title.
6. Create an SEO meta description between 140-160 characters.
7. Create an SEO-friendly URL slug.
8. Provide one primary focus keyword.
9. Provide 5-10 secondary keywords.
10. Create a compelling introduction.
11. Use logical H2 and H3 headings.
12. Make headings meaningful and keyword relevant.
13. Use short paragraphs.
14. Use bullet points where useful.
15. Use numbered lists where useful.
16. Naturally use the target keyword without keyword stuffing.
17. Include semantic/related keywords.
18. Include an FAQ section.
19. Include a conclusion.
20. Include a suggested featured image prompt.
21. Make the article comprehensive and useful.
22. Avoid fake statistics and unsupported claims.
23. Aim for approximately 1500-2200 words.

SEO STRUCTURE:

- SEO title
- Meta description
- URL slug
- Focus keyword
- Secondary keywords
- Search intent
- Article introduction
- Multiple H2 sections
- H3 subsections where useful
- Lists
- FAQ
- Conclusion
- Featured image prompt

Return JSON in exactly this structure:

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
            temperature: 0.65,
            maxOutputTokens: 8000,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const articleData = await articleResponse.json();

    if (!articleResponse.ok) {
      console.error("Article Gemini error:", articleData);

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
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw AI response:", articleText);

      return res.status(502).json({
        error: "AI returned invalid article data."
      });
    }

    /*
     * ============================
     * STEP 2 — GENERATE IMAGE
     * ============================
     */

    let image = null;

    try {
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
                    text:
                      article.imagePrompt ||
                      `Create a professional editorial featured image for an article about ${keyword}. Modern, clean, premium, realistic, no logos, no watermark text, suitable for a professional business website.`
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

      if (imageResponse.ok) {
        const parts =
          imageData?.candidates?.[0]?.content?.parts || [];

        const imagePart = parts.find(
          (part) => part?.inlineData?.data
        );

        if (imagePart) {
          image = {
            mimeType:
              imagePart.inlineData.mimeType ||
              "image/png",
            data: imagePart.inlineData.data
          };
        }
      } else {
        console.error("Image generation error:", imageData);
      }
    } catch (imageError) {
      console.error("Image generation failed:", imageError);
    }

    /*
     * ============================
     * STEP 3 — RETURN EVERYTHING
     * ============================
     */

    return res.status(200).json({
      success: true,
      article,
      image
    });

  } catch (error) {
    console.error("Article API error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Something went wrong while generating the article."
    });
  }
}
