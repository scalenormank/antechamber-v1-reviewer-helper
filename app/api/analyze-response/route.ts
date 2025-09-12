import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"
import { validateApiRequest, sanitizeForPrompt, validateAndSanitizeJSON } from "@/lib/input-validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input
    const validation = validateApiRequest(
      body,
      ['systemPrompt', 'userPrompt', 'toolCall', 'toolOutput', 'aiResponse'],
      request.headers.get('x-forwarded-for') || 'anonymous'
    )

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: "Input validation failed", 
          details: validation.errors 
        }, 
        { status: 400 }
      )
    }

    const { systemPrompt, userPrompt, toolCall, toolOutput, aiResponse } = validation.sanitizedBody

    const analysisPrompt = `You are an AI response analyzer. Analyze the following AI interaction and provide detailed feedback on two key areas:

SYSTEM PROMPT:
${sanitizeForPrompt(systemPrompt)}

USER PROMPT:
${sanitizeForPrompt(userPrompt)}

TOOL CALL:
${sanitizeForPrompt(toolCall)}

TOOL OUTPUT:
${sanitizeForPrompt(toolOutput)}

AI RESPONSE:
${sanitizeForPrompt(aiResponse)}

Please analyze and provide results for these two checks:

**1. GROUNDING CHECK**  
Verify whether every factual statement in the AI response is **supported by either**:  
- The provided tool output, **or**  
- Generally accepted, time-invariant world knowledge (facts that are true regardless of date).  

The agent must:  
- Identify any claims not directly supported by either source.  
- Flag speculation, opinions, assumptions, or hallucinations (e.g., invented details, fabricated numbers, or causal links not found in the sources).  
- Distinguish between neutral stylistic phrasing (acceptable) and factual assertions (must be grounded).  

---

**2. RESPONSE COMPLETENESS CHECK**  
Evaluate whether the response fulfills **all explicit and implicit requirements** in the user prompt.  

The agent must:  
- Confirm that each explicit request (e.g., "list X," "summarize Y") is fully addressed.  
- Detect if any implicit expectations (e.g., explanation when asked to "fix," reasoning when asked to "analyze") are missing.  
- Flag partial, incomplete, or underdeveloped answers.  
- Note if the response avoided required depth, skipped subtasks, or only superficially covered the request.  

IMPORTANT: You must respond with ONLY valid JSON in exactly this format. Do not include any other text before or after the JSON:

{
  "groundingCheck": {
    "status": "pass" | "fail" | "warning",
    "details": "detailed explanation",
    "issues": ["list of specific issues if any"]
  },
  "responseCompletenessCheck": {
    "status": "pass" | "fail" | "warning",
    "details": "detailed explanation", 
    "issues": ["list of specific issues if any"]
  }
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: analysisPrompt,
    })

    console.log("[v0] Raw API Response:", text)

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
    const jsonValidation = validateAndSanitizeJSON(cleanedText)
    
    if (!jsonValidation.isValid) {
      console.error("[v0] JSON Validation Error:", jsonValidation.error)
      console.error("[v0] Raw text:", text)

      // Return a fallback structure
      analysisResult = {
        groundingCheck: {
          status: "fail",
          details: "Analysis failed due to parsing error",
          issues: ["Could not parse AI response safely"],
        },
        responseCompletenessCheck: {
          status: "fail",
          details: "Analysis failed due to parsing error",
          issues: ["Could not parse AI response safely"],
        },
        overallScore: 0,
        summary: "Analysis could not be completed due to technical error",
      }
    } else {
      analysisResult = jsonValidation.data

      // Validate the structure
      if (
        !analysisResult.groundingCheck ||
        !analysisResult.responseCompletenessCheck
      ) {
        throw new Error("Invalid response structure")
      }
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
