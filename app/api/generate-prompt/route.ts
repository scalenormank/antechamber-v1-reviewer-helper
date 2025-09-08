import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      systemSettings,
      selectedTools,
      applicationContext,
      userContext,
      complexityRequirements,
      contextInfoRequirements,
    } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    if (!complexityRequirements || !contextInfoRequirements) {
      return NextResponse.json({ error: "Missing required selections" }, { status: 400 })
    }

    let parsedSystemSettings
    try {
      parsedSystemSettings = typeof systemSettings === "string" ? JSON.parse(systemSettings) : systemSettings
    } catch (e) {
      parsedSystemSettings = {}
    }

    const contextText = applicationContext && applicationContext.trim() ? applicationContext : ""
    const userContextText = userContext && userContext.trim() ? userContext : ""

    const templateStructure = `
### **SYSTEM SETTINGS**
\`\`\`json
${JSON.stringify(parsedSystemSettings, null, 2)}
\`\`\`

### **APPLICATION USE CONTEXT**
\`\`\`
${contextText}
\`\`\`

### **AVAILABLE TOOLS/DOMAINS**
\`\`\`
${selectedTools && selectedTools.length > 0 ? selectedTools.join(", ") : "No specific tools selected"}
\`\`\`

### **COMPLEXITY REQUIREMENTS**
\`\`\`
${complexityRequirements.map((req: any) => `${req.id}. ${req.name}`).join("\n")}
\`\`\`
`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating sophisticated AI system prompts following the Advanced System Prompt Generator methodology.

You must create a system prompt following this EXACT structure:

**PARAGRAPH 1:** Start with "You are [role/assistant type] for a user currently located at [full address from system settings]. [Integrate device settings naturally - wifi status, cellular, location services, battery mode, timezone]. [Brief context about user's situation]."

**PARAGRAPH 2:** Copy the APPLICATION USE CONTEXT exactly as provided word-for-word. Do not modify, interpret, or rephrase anything from the application context.

**REMAINING PARAGRAPHS:** Build the prompt using selected complexity requirements with:
- Specific tool usage rules and triggers
- Exact response formats and behaviors  
- Clear boundaries and protocols
- Concrete examples (e.g., "exactly 3 results," "minimum 5 tool calls")
- Measurable criteria and specific instructions

**MANDATORY REQUIREMENTS:**
- Write in natural paragraphs (no bullet points or lists)
- Include ALL selected complexity requirements with specific instructions
- Define precise tool usage rules with keywords/triggers
- Specify exact response formats and behaviors
- Set clear boundaries and safety protocols

You must return a JSON response with:
1. "prompt" - the complete system prompt following the structure above
2. "sections" - an object with keys section_1 through section_7 containing the divided content

The 7 sections must be:
1. Context Information about Applications and Entities
2. Personality and Tone definition
3. Critical, Non-Negotiable Facts
4. Tool Use and Response Formatting guidelines
5. Guardrails and Safety Protocols
6. Dynamic Behavior Scaling instructions
7. Critical Evaluation of User Input instructions`,
          },
          {
            role: "user",
            content: `Create a sophisticated system prompt using this template structure:

${templateStructure}

**Context Information Requirements:**
${contextInfoRequirements.map((req: any) => `- ${req.name}: ${req.description}`).join("\n")}

**Complexity Requirements Details:**
${complexityRequirements.map((req: any) => `- ${req.name}: ${req.description}`).join("\n")}

Generate a natural, flowing system prompt that follows the exact structure specified. The prompt should integrate the system settings naturally, copy the application context exactly, and implement all complexity requirements as behavioral guidelines.

Return as JSON with "prompt" and "sections" keys.`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    let result

    try {
      result = JSON.parse(data.choices[0].message.content)
      if (!result.template) {
        result.template = templateStructure
      }
    } catch (e) {
      result = {
        prompt: data.choices[0].message.content,
        sections: {},
        template: templateStructure,
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating prompt:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate system prompt",
      },
      { status: 500 },
    )
  }
}
