import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"
import { validateApiRequest, sanitizeForPrompt } from "@/lib/input-validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input
    const validation = validateApiRequest(
      body,
      ['prompt'],
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

    const { prompt } = validation.sanitizedBody

    const contradictionAnalysisPrompt = `You are a specialized system prompt evaluator designed to strictly analyze system prompts for **contradictions** and **banned content**.  

Your task is to read the entire provided system prompt and return a structured JSON report with two checks:

1. **Contradictions Check**  
   - Determine if the system prompt contains any internal contradictions.  
   - Be strict: even subtle conflicts in instructions, tone, or requirements should be flagged.  
   - Output must include a boolean (yes/no) and, if yes, a list of contradictions quoted directly from the prompt.

2. **Banned Content Check**  
   - Identify if the system prompt includes any banned content based on these rules:  
     [[Banned Content:  
     No Explaining User Behavior Patterns  
      ❌ Don't explain that the user gives minimal information, withholds context, or will correct only after mistakes.  
     ✅ Instead, just design the prompt so the agent infers and adapts naturally.  

     No Stating Infeasible Tool Use Rules  
      ❌ Don't say \"you can't access inventory or payment tools\" or \"you must fail gracefully if a tool doesn't work.\"  
     ✅ Let the agent discover and respond to these limits through action, not exposition.  

     No Forecasting Task Switching  
      ❌ Avoid lines like \"the user will change direction mid-task.\"  
     ✅ Just construct scenarios where that naturally happens, and let the agent react appropriately.  

     No Stating Obvious Tool Descriptions  
      ❌ Example: \"The search_places tool can be used to find local places based on a search query\"  
      ✅ Example: \"The reddit search tool can also be used to find local places in a city and also search recommendations by locals. Prefer this when the user asks for recommendations, over search_places\"  
     ]]  

   - Output must include a boolean (yes/no) and, if yes, a list of the banned content passages quoted directly from the prompt.

---

### **OUTPUT FORMAT (MUST BE VALID JSON, NO EXTRA TEXT):**

{
  \"has_contradictions\": \"yes/no\",
  \"contradictions_list\": [\"<exact contradiction text>\", ...],
  \"has_banned_content\": \"yes/no\",
  \"banned_content_list\": [\"<exact banned content text>\", ...]
}

Do not include any explanation outside of the JSON object. Only return the JSON as the final output.

**SYSTEM PROMPT TO ANALYZE:**
${sanitizeForPrompt(prompt)}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: contradictionAnalysisPrompt,
    })

    console.log("[v0] Raw Contradiction Analysis Response:", text)

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
        typeof analysisResult.has_contradictions !== "string" ||
        !Array.isArray(analysisResult.contradictions_list) ||
        typeof analysisResult.has_banned_content !== "string" ||
        !Array.isArray(analysisResult.banned_content_list)
      ) {
        throw new Error("Invalid response structure")
      }
    } catch (parseError) {
      console.error("[v0] JSON Parse Error:", parseError)
      console.error("[v0] Raw text:", text)

      // Return a fallback structure
      analysisResult = {
        has_contradictions: "no",
        contradictions_list: [],
        has_banned_content: "no",
        banned_content_list: [],
      }
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("[v0] Contradiction analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze contradictions and banned content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
