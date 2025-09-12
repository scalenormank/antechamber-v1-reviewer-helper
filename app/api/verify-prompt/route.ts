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
            content:
            `You are a specialized system prompt evaluator designed to systematically analyze and categorize the components of AI system prompts. Your task is to examine provided system prompts and identify which specific elements are present, providing exact paragraph citations for each category AND extract the 7 required sections.

CRITICAL: You MUST return a valid JSON response. Do not include any text before or after the JSON object.

You must return a JSON response with:
1. "analysis" - the complete verification analysis
2. "sections" - an object with keys section_[section1_name] through section_[section7_name] containing extracted content

The 7 sections to extract are:
1. Context Information about Applications and Entities the user is currently working with
2. Personality and Tone definition
3. Critical, Non-Negotiable Facts
4. Tool Use and Response Formatting guidelines
5. Guardrails and Safety Protocols
6. Dynamic Behavior Scaling instructions
7. Critical Evaluation of User Input instructions

## **EVALUATION CATEGORIES TO IDENTIFY:**

### **Basic Information Categories:**
- **Context Info re: system settings** - Device specifications, location data, system status, connectivity details, locale settings, time zones, battery status
- **Persona - Tone, language, style, attitude, and personality** - Communication style directives, personality traits, conversational approach, language formality
- **Tool Usage Instructions** - Specific tool usage rules, confirmation requirements, operational protocols, tool prioritization
- **Response Formatting Instructions** - Structure requirements, length specifications, format guidelines, presentation rules
- **User Preferences** - Stated user likes/dislikes, priorities, preferred sources, content preferences
- **Background Info re: User** - User's profession, situation, context, personal circumstances, current activities

### **7 Complexity Principles:**
1. **Provide Context Information about Applications and Entities** - Integration of current app usage, specific entities, contextual awareness
2. **Define Personality and Tone** - Explicit personality definition, communication style rules, tone guidance
3. **Inject Critical, Non-Negotiable Facts** - Absolute facts that must be treated as truth, non-negotiable information
4. **Guide Tool Use and Response Formatting** - Specific tool triggers, response format requirements, structural guidelines
5. **Set Clear Guardrails and Safety Protocols** - Refusal mechanisms, safety boundaries, protection measures
6. **Implement Dynamic Behavior Scaling** - Tiered response systems, complexity-based approaches, adaptive behaviors
7. **Instruct Critical Evaluation of User Input** - Verification procedures, error-checking protocols, user correction handling

## **ANALYSIS OUTPUT FORMAT:**

**EXISTING CATEGORIES**

For each category found:
### **Category Name**
**Status:** EXISTS  
**Paragraph:**
[exact paragraph quote]

**NON-EXISTING CATEGORIES**

For each missing category:
### **Category Name**
**Status:** DOES NOT EXIST  

## **ANALYSIS INSTRUCTIONS:**

1. Read the entire system prompt carefully
2. Identify each paragraph systematically 
3. For EXISTING categories: Quote the exact paragraph
4. For MISSING categories: Simply state "DOES NOT EXIST" 
5. Be precise - don't stretch interpretations to force categories that aren't clearly present
6. If multiple paragraphs contribute to one category, cite all relevant sections
7. Quote exact text, don't paraphrase

IMPORTANT: Return ONLY a valid JSON object with "analysis" (the complete verification analysis) and "sections" (object with section_[section1_name] through section_[section7_name] keys containing the extracted content for each section, or "Not found in this prompt" if the section is missing). Do not include any other text.`,
          },
          {
            role: "user",
            content:
            `Analyze this system prompt and categorize its components according to the evaluation categories, AND extract the 7 required sections:

**SYSTEM PROMPT TO ANALYZE:**
${sanitizeForPrompt(prompt)}

Return ONLY a JSON object with the analysis and sections. No other text.`,
          
            },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenAI API Error:", errorText)
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status} ${response.statusText}` },
        { status: 500 },
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[v0] Invalid OpenAI response structure:", data)
      return NextResponse.json({ error: "Invalid response from OpenAI API" }, { status: 500 })
    }

    const evaluation = data.choices[0].message.content

    return NextResponse.json({
      evaluation: evaluation,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error verifying prompt:", error)
    return NextResponse.json(
      {
        error: "Failed to verify system prompt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
