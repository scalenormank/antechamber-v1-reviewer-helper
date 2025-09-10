import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt, toolCall, toolOutput, aiResponse } = await request.json()

    const errorAnalysisPrompt = `You are an expert error analysis system. Analyze the following AI interaction and identify specific error types present in the AI response.

SYSTEM PROMPT:
${systemPrompt}

USER PROMPT:
${userPrompt}

TOOL CALL:
${toolCall}

TOOL OUTPUT:
${toolOutput}

AI RESPONSE:
${aiResponse}

Please analyze the AI response and identify any errors. Focus on these common error categories:

1. **Factual Errors** - Incorrect information, false claims, or inaccurate data
2. **Logical Errors** - Flawed reasoning, contradictions, or illogical conclusions
3. **Format Errors** - Incorrect response format, missing required elements, or structural issues
4. **Tool Usage Errors** - Incorrect tool calls, misinterpreted tool outputs, or missing tool usage
5. **Context Errors** - Misunderstanding user intent, ignoring context, or irrelevant responses
6. **Safety Errors** - Harmful content, inappropriate responses, or policy violations
7. **Completeness Errors** - Incomplete answers, missing information, or partial responses
8. **Consistency Errors** - Contradictory statements, inconsistent tone, or conflicting information

For each error found, provide:
- Error type and severity (Low/Medium/High/Critical)
- Description of the error
- Specific examples from the response
- Recommendations for improvement

IMPORTANT: You must respond with ONLY valid JSON in exactly this format. Do not include any other text before or after the JSON:

{
  "errorCount": 0,
  "errorTypes": [
    {
      "type": "Error Type Name",
      "severity": "Low|Medium|High|Critical",
      "description": "Detailed description of the error",
      "examples": ["Specific example 1", "Specific example 2"],
      "location": "Where in the response the error occurs"
    }
  ],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "summary": "Overall assessment of error patterns and severity"
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: errorAnalysisPrompt,
    })

    console.log("[v0] Raw Error Analysis Response:", text)

    let cleanedText = text.trim()

    // Remove any markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Find the JSON object boundaries
    const jsonStart = cleanedText.indexOf("{")
    const jsonEnd = cleanedText.lastIndexOf("}")

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1)
    }

    console.log("[v0] Cleaned text for parsing:", cleanedText)

    let analysisResult
    try {
      analysisResult = JSON.parse(cleanedText)

      // Validate the structure
      if (
        typeof analysisResult.errorCount !== "number" ||
        !Array.isArray(analysisResult.errorTypes) ||
        !Array.isArray(analysisResult.recommendations) ||
        typeof analysisResult.summary !== "string"
      ) {
        throw new Error("Invalid response structure")
      }
    } catch (parseError) {
      console.error("[v0] JSON Parse Error:", parseError)
      console.error("[v0] Raw text:", text)

      // Return a fallback structure
      analysisResult = {
        errorCount: 0,
        errorTypes: [],
        recommendations: ["Unable to parse error analysis results"],
        summary: "Error analysis could not be completed due to parsing error",
      }
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("[v0] Error type analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze error types",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
