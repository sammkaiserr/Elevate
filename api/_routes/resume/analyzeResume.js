const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function analyzeResume(resumeText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in .env");
  }

  const prompt = `Analyze the following resume and extract:
- ATS score (0-100) based on overall quality, readability, and impactful metrics
- Overall feedback (2-3 sentences max)
- Actionable suggestions to improve the resume
- Better keywords that should be added to improve ATS compatibility
- technical skills
- soft skills
- missing skills or areas of improvement

Return result ONLY as valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "ats_score": 85,
  "feedback": "",
  "suggestions": [],
  "better_keywords": [],
  "technical_skills": [],
  "soft_skills": [],
  "missing_skills": []
}

Resume:
${resumeText}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a resume analysis expert. Always respond with valid JSON only, no markdown or extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      `Groq API error (${response.status}): ${errData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  let text = data.choices?.[0]?.message?.content || "";

  // Clean up response - remove markdown code blocks if present
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Groq response:", text);
    throw new Error("Failed to parse AI response. Please try again.");
  }
}
