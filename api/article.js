export default async function handler(req, res) {
  /*
  =========================================================
  AUTOPILOT AI — ARTICLE + IMAGE GENERATION API
  =========================================================
  */

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

    /*
    =========================================================
    VALIDATE KEYWORD
    =========================================================
    */

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        error: "Please enter a target keyword."
      });
    }

    /*
    =========================================================
    GEMINI API KEY
    =========================================================
    */

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY is not configured in Vercel."
      });
    }

    const cleanKeyword =
      keyword.trim();

    /*
    =========================================================
    STEP 1
    SEO ARTICLE GENERATION
    =========================================================
    */

    const articlePrompt = `
You are AutoPilot AI, an elite SEO strategist,
professional editor, content writer and digital
marketing expert.

Create a completely publication-ready article.

TARGET KEYWORD:
${cleanKeyword}

LANGUAGE:
${language}

TONE:
${tone}

TARGET AUDIENCE:
${audience}

ARTICLE LENGTH:
${length}

IMPORTANT:

Write a genuinely useful article for real readers.

The article must feel professionally written by an
experienced human SEO writer.

DO NOT mention:
- AI
- Gemini
- prompts
- content generation
- this instruction
- being an AI

SEO REQUIREMENTS:

1. Create an attractive SEO title.
2. Naturally include the primary keyword in the title.
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
17. Add FAQ section.
18. Add a strong conclusion.
19. Create a professional featured-image prompt.
20. Target approximately 1800-2500 words.
21. Never invent statistics.
22. Never make unsupported factual claims.
23. Make the article useful enough to publish directly.

IMAGE PROMPT REQUIREMENTS:

Create a detailed image prompt for a premium blog
featured image.

The image prompt must describe:
- main subject
- visual composition
- environment
- lighting
- professional style
- realistic details
- 16:9 blog featured-image composition

Do not request logos or watermarks.

STRUCTURE:

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

Do not use:
###
##
**
---

Do not put markdown heading symbols inside content.

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

    /*
    =========================================================
    CALL GEMINI FOR ARTICLE
    =========================================================
    */

    const articleUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const articleResponse =
      await fetch(articleUrl, {
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
                  text: articlePrompt
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.55,

            maxOutputTokens: 12000,

            responseMimeType:
              "application/json"
          }
        })
      });

    const articleData =
      await articleResponse.json();

    /*
    =========================================================
    ARTICLE API ERROR
    =========================================================
    */

    if (!articleResponse.ok) {
      console.error(
        "ARTICLE GEMINI ERROR:",
        JSON.stringify(
          articleData,
          null,
          2
        )
      );

      return res.status(
        articleResponse.status
      ).json({
        error:
          articleData?.error?.message ||
          "Article generation failed."
      });
    }

    /*
    =========================================================
    EXTRACT ARTICLE TEXT
    =========================================================
    */

    const articleParts =
      articleData
        ?.candidates?.[0]
        ?.content?.parts || [];

    const articleText =
      articleParts
        .map(
          (part) =>
            part?.text || ""
        )
        .join("");

    if (!articleText) {
      console.error(
        "EMPTY ARTICLE RESPONSE:",
        JSON.stringify(
          articleData,
          null,
          2
        )
      );

      return res.status(502).json({
        error:
          "Gemini returned an empty article."
      });
    }

    /*
    =========================================================
    PARSE JSON
    =========================================================
    */

    let article;

    try {
      article =
        JSON.parse(
          articleText
        );
    } catch (error) {
      console.error(
        "ARTICLE JSON ERROR:",
        error
      );

      console.error(
        "RAW ARTICLE RESPONSE:",
        articleText
      );

      return res.status(502).json({
        error:
          "AI returned invalid article JSON."
      });
    }

    /*
    =========================================================
    NORMALIZE ARTICLE
    =========================================================
    */

    article = {
      title:
        article?.title ||
        `Complete Guide to ${cleanKeyword}`,

      metaDescription:
        article?.metaDescription ||
        "",

      slug:
        article?.slug ||
        cleanKeyword
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          ),

      focusKeyword:
        article?.focusKeyword ||
        cleanKeyword,

      secondaryKeywords:
        Array.isArray(
          article?.secondaryKeywords
        )
          ? article.secondaryKeywords
          : [],

      searchIntent:
        article?.searchIntent ||
        "Informational",

      excerpt:
        article?.excerpt ||
        "",

      introduction:
        article?.introduction ||
        "",

      sections:
        Array.isArray(
          article?.sections
        )
          ? article.sections
          : [],

      faq:
        Array.isArray(
          article?.faq
        )
          ? article.faq
          : [],

      conclusion:
        article?.conclusion ||
        "",

      imagePrompt:
        article?.imagePrompt ||
        "",

      wordCount:
        article?.wordCount ||
        0
    };

    /*
    =========================================================
    STEP 2
    AI FEATURED IMAGE
    =========================================================
    */

    let image = null;

    const imagePrompt =
      article.imagePrompt ||
      `
Create a premium professional editorial
featured image for a blog article.

Topic:
${cleanKeyword}

Article title:
${article.title}

Create a visually impressive scene that clearly
represents the article topic.

Style:
- premium
- realistic
- modern
- professional
- editorial
- clean
- high-end
- natural lighting
- cinematic depth
- sharp details
- visually engaging
- suitable for a professional website

Composition:
- wide horizontal composition
- 16:9 aspect ratio
- strong focal subject
- balanced composition
- professional background
- enough visual breathing room

Do not include:
- logos
- watermarks
- random text
- fake UI
- distorted objects
- unnecessary icons
`;

    /*
    =========================================================
    IMAGE API CALL
    =========================================================
    */

    try {
      console.log(
        "Starting AI image generation..."
      );

      const imageUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=" +
        encodeURIComponent(apiKey);

      const imageResponse =
        await fetch(imageUrl, {
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
              responseModalities: [
                "TEXT",
                "IMAGE"
              ],

              responseFormat: {
                image: {
                  aspectRatio:
                    "16:9",

                  imageSize:
                    "1K"
                }
              }
            }
          })
        });

      const imageData =
        await imageResponse.json();

      /*
      =======================================================
      IMAGE API ERROR
      =======================================================
      */

      if (!imageResponse.ok) {
        console.error(
          "IMAGE API ERROR STATUS:",
          imageResponse.status
        );

        console.error(
          "IMAGE API ERROR:",
          JSON.stringify(
            imageData,
            null,
            2
          )
        );
      } else {
        console.log(
          "Image API response received."
        );

        /*
        =====================================================
        FIND IMAGE PART
        =====================================================
        */

        const imageParts =
          imageData
            ?.candidates?.[0]
            ?.content?.parts || [];

        console.log(
          "IMAGE PART COUNT:",
          imageParts.length
        );

        const imagePart =
          imageParts.find(
            (part) =>
              part?.inlineData?.data
          );

        /*
        =====================================================
        IMAGE FOUND
        =====================================================
        */

        if (imagePart) {
          const mimeType =
            imagePart
              ?.inlineData
              ?.mimeType ||
            "image/png";

          const base64Data =
            imagePart
              ?.inlineData
              ?.data;

          if (
            base64Data &&
            base64Data.length > 100
          ) {
            image = {
              mimeType:
                mimeType,

              data:
                base64Data
            };

            console.log(
              "IMAGE GENERATED SUCCESSFULLY."
            );

            console.log(
              "IMAGE MIME TYPE:",
              mimeType
            );

            console.log(
              "IMAGE DATA LENGTH:",
              base64Data.length
            );
          }
        } else {
          console.error(
            "NO IMAGE PART FOUND."
          );

          console.error(
            "IMAGE RESPONSE:",
            JSON.stringify(
              imageData,
              null,
              2
            )
          );
        }
      }
    } catch (imageError) {
      /*
      =======================================================
      IMAGE FAILURE SHOULD NOT DESTROY ARTICLE
      =======================================================
      */

      console.error(
        "IMAGE GENERATION EXCEPTION:",
        imageError
      );
    }

    /*
    =========================================================
    STEP 3
    CALCULATE WORD COUNT
    =========================================================
    */

    const allText = [
      article.title || "",

      article.introduction ||
        "",

      ...(article.sections ||
        []).flatMap(
        (section) => [
          section?.heading ||
            "",

          ...(section?.paragraphs ||
            []),

          ...(section?.bullets ||
            []),

          ...(section?.subsections ||
            []).flatMap(
            (
              subsection
            ) => [
              subsection?.heading ||
                "",

              ...(subsection?.paragraphs ||
                []),

              ...(subsection?.bullets ||
                [])
            ]
          )
        ]
      ),

      ...(article.faq ||
        []).flatMap(
        (item) => [
          item?.question ||
            "",

          item?.answer ||
            ""
        ]
      ),

      article.conclusion ||
        ""
    ].join(" ");

    const calculatedWordCount =
      allText
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    /*
    =========================================================
    FINAL IMAGE URL
    =========================================================
    */

    let imageUrl = null;

    if (
      image?.data &&
      image?.mimeType
    ) {
      imageUrl =
        `data:${image.mimeType};base64,${image.data}`;
    }

    /*
    =========================================================
    FINAL RESPONSE
    =========================================================
    */

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
          0,

        imageUrl:
          imageUrl
      },

      /*
      Keep BOTH formats because
      App.jsx can use image object.
      */

      image:
        image,

      imageUrl:
        imageUrl
    });
  } catch (error) {
    /*
    =========================================================
    GLOBAL ERROR
    =========================================================
    */

    console.error(
      "ARTICLE API GLOBAL ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Something went wrong while generating the article."
    });
  }
}
