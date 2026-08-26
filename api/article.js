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
    // STEP 1 — PREMIUM SEO ARTICLE GENERATION
    // =====================================================

    const articlePrompt = `
You are a senior digital publisher, expert SEO strategist,
professional journalist, subject-matter writer and
experienced editorial content creator.

Your task is to write a HIGH-QUALITY, publication-ready
article that could realistically appear on a respected
professional website.

The article must NOT feel like a generic AI-generated article.

It must feel researched, thoughtful, specific, useful,
well-structured and professionally edited.

=====================================================
ARTICLE INPUT
=====================================================

PRIMARY KEYWORD:
${cleanKeyword}

LANGUAGE:
${language}

TONE:
${tone}

=====================================================
CORE OBJECTIVE
=====================================================

Write for a real person who searched for:

"${cleanKeyword}"

First determine what this person actually wants to know.

The article must satisfy the search intent immediately and
then progressively provide deeper information.

Do not write simply to reach a word count.

Every paragraph must have a purpose.

Every section must teach, explain, compare, demonstrate,
solve a problem or provide useful guidance.

=====================================================
HUMAN EDITORIAL STYLE
=====================================================

Write naturally and professionally.

Use:

- varied sentence lengths
- natural transitions
- precise wording
- clear explanations
- concrete examples
- practical recommendations
- contextual details
- useful comparisons
- realistic scenarios
- confident but balanced language

Avoid:

- robotic wording
- repetitive sentence patterns
- generic introductions
- filler paragraphs
- unnecessary summaries
- excessive headings
- keyword stuffing
- exaggerated claims
- fake authority
- vague advice
- obvious AI-style phrases

Do NOT repeatedly use phrases such as:

"Whether you are..."
"In today's digital world..."
"In today's fast-paced world..."
"It is important to note..."
"Understanding this..."
"By following these..."
"In conclusion..."

Use natural alternatives.

=====================================================
FACTUAL ACCURACY
=====================================================

Do not invent:

- statistics
- research
- studies
- surveys
- expert quotes
- company claims
- dates
- prices
- percentages
- citations

If a specific fact cannot be confidently established,
write around it rather than inventing it.

Do not make unsupported claims.

When discussing products, services, technologies,
laws, prices or current information, avoid pretending
that information is current unless it is provided in
the prompt.

=====================================================
INTRODUCTION
=====================================================

Write a strong opening.

The introduction should:

1. Start with the reader's actual problem, question or goal.
2. Explain why the topic matters.
3. Give the reader a clear idea of what they will learn.
4. Naturally introduce the primary keyword.
5. Avoid generic motivational statements.
6. Avoid unnecessary history or background.

The introduction should feel like a professional editor
wrote it specifically for the search query.

=====================================================
ARTICLE STRUCTURE
=====================================================

Create 7 strong H2 sections.

Each H2 must cover a DISTINCT aspect of the topic.

Do not repeat information between sections.

Use H3 subsections only when they genuinely improve
the explanation.

Each major section should contain:

- 2-4 substantial paragraphs
- practical details
- examples when appropriate
- bullets or numbered steps when useful
- useful H3 subsections when appropriate

Do not create short meaningless sections.

Do not create sections just to satisfy a number.

=====================================================
DEPTH REQUIREMENT
=====================================================

The article should demonstrate actual understanding.

For each major concept:

1. Explain WHAT it is.
2. Explain WHY it matters.
3. Explain HOW it works or should be approached.
4. Give an example when useful.
5. Explain common mistakes or limitations when relevant.
6. Give a practical recommendation.

This creates depth instead of surface-level content.

=====================================================
PRACTICAL EXAMPLES
=====================================================

Where appropriate, include realistic examples.

Examples should help the reader understand the topic.

Do not invent fake statistics or fake case studies.

Use hypothetical examples only when clearly presented
as examples.

=====================================================
LISTS
=====================================================

Use bullet lists for:

- key points
- features
- advantages
- mistakes
- considerations
- quick recommendations

Use numbered lists for:

- processes
- step-by-step instructions
- strategies
- workflows

Do not turn every paragraph into a list.

=====================================================
SEARCH INTENT
=====================================================

Identify the most appropriate search intent.

Possible intents include:

- informational
- commercial investigation
- transactional
- navigational

Choose the best one for the keyword.

=====================================================
SEO REQUIREMENTS
=====================================================

Create:

1. Strong SEO title.
2. Meta description between 140-160 characters.
3. Clean URL slug.
4. Focus keyword.
5. 8-12 secondary keywords.
6. Search intent.
7. Short useful excerpt.
8. Semantically relevant language.

The primary keyword should appear naturally.

Do NOT force the keyword into every heading.

Do NOT keyword stuff.

=====================================================
FAQ
=====================================================

Create EXACTLY 6 useful FAQ questions.

Questions should represent realistic things people
would ask after reading the article.

Answers must be detailed and useful.

Do not repeat entire sections of the article.

=====================================================
CONCLUSION
=====================================================

Write a strong conclusion.

Do not simply repeat the introduction.

Summarize the most important practical takeaways.

End with a useful final recommendation or perspective.

=====================================================
FEATURED IMAGE PROMPT
=====================================================

Create a detailed image-generation prompt based on
the actual article.

The image should visually communicate the topic.

Describe:

- main subject
- environment
- important objects
- composition
- perspective
- lighting
- depth
- mood
- visual style

The image should look like a premium editorial
featured image for a professional publication.

Do NOT request:

- text
- logos
- watermarks
- titles
- UI
- screenshots
- fake interfaces

inside the image.

=====================================================
ARTICLE LENGTH
=====================================================

Target approximately 1800-2500 words.

Do NOT artificially repeat ideas to reach the target.

Quality is more important than word count.

=====================================================
FINAL QUALITY CHECK
=====================================================

Before returning the article, silently check:

- Does the article actually answer the search query?
- Is the introduction strong?
- Does every H2 add new information?
- Are paragraphs substantial?
- Are examples useful?
- Is the writing natural?
- Is anything repetitive?
- Is there filler?
- Are SEO keywords natural?
- Are all 6 FAQs useful?
- Is the conclusion meaningful?
- Is the image prompt relevant?

If any section feels generic, rewrite it before returning.

=====================================================
STRICT JSON OUTPUT
=====================================================

Return ONLY valid JSON.

Do NOT return:

- markdown
- code fences
- explanations
- comments
- text before JSON
- text after JSON

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
    // STEP 2 — HUGGING FACE FEATURED IMAGE
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

      console.log(
        "HF provider: fal-ai"
      );

      console.log(
        "HF model: black-forest-labs/FLUX.1-dev"
      );

      // Token MUST be passed as a string.
      const hf = new InferenceClient(hfToken);

      const generatedImage =
        await hf.textToImage({
          provider: "fal-ai",

          model:
            "black-forest-labs/FLUX.1-dev",

          inputs: imagePrompt,

          parameters: {
            width: 1344,
            height: 768,
            num_inference_steps: 4
          }
        });

      // ===================================================
      // CONVERT IMAGE TO BASE64
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
