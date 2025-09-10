import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt, toolCall, toolOutput, aiResponse } = await request.json()

    const errorAnalysisPrompt = `You are an expert error analysis system. Analyze the following AI interaction and identify which specific error categories apply to the AI response. Your task is to classify errors into one or more of the **CATEGORIES** provided below. Only select from the exact items listed in **CATEGORIES**. Do not output the category classes (e.g., "Tool Usage Errors", "Parameter Errors"); only the items.

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

CATEGORIES (use only these in your output):
- Wrong_tool_selected
- No_tool_triggered
- Tool_over_triggered
- Wrong_param_value
- Required_param_missing
- Extra_param_predicted
- Param_not_defined
- Param_type_inconsistent
- Enum_not_respected
- Parallel_calls_missing
- Unsatisfactory_summary
- Tool_call_not_parsable
- Others
- no_issues

Instructions:
1. Examine the AI response in relation to the system prompt, user prompt, tool call, and tool output.  
2. Determine if any of the error categories listed above apply. If none apply, select **no_issues**.  
3. For each identified error, provide:
   - 'type': The exact category name from CATEGORIES.
   - 'severity': One of Low, Medium, High, or Critical.
   - 'description': A clear explanation of the error.
   - 'examples': One or more specific excerpts from the AI response that illustrate the error.
   - 'location': Where in the AI response or tool call/output the error occurs.
4. Provide actionable 'recommendations' to avoid or fix the errors.
5. Write a short 'summary' describing the overall error patterns and severity.

IMPORTANT: You must respond with ONLY valid JSON in exactly this format. Do not include any text before or after the JSON:

{
  "errorCount": 0,
  "errorTypes": [
    {
      "type": "Wrong_tool_selected",
      "severity": "High",
      "description": "The AI chose an incorrect tool despite context indicating the correct one.",
      "examples": ["Example excerpt here"],
      "location": "Section of AI response or tool call"
    }
  ],
  "recommendations": [
    "Ensure tool selection is aligned with the system prompt and user intent",
    "Double-check parameters before finalizing the response"
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
