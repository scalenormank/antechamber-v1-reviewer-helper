import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, evaluationTests } = await request.json()

    if (!prompt || !evaluationTests || evaluationTests.length === 0) {
      return NextResponse.json({ error: "Prompt and evaluation tests are required" }, { status: 400 })
    }

    const results: Record<string, any> = {}

    // Run each evaluation test
    for (const test of evaluationTests) {
      const evaluationPrompt = `
You are an expert system prompt evaluator. Analyze the following system prompt for: ${test.name}

Description: ${test.description}
Category: ${test.category}

System Prompt to Evaluate:
"""
${prompt}
"""

Provide your evaluation in the following JSON format:
{
  "score": <number between 0-100>,
  "analysis": "<detailed analysis of this specific aspect>",
  "suggestions": "<specific suggestions for improvement>",
  "strengths": "<what works well in this area>",
  "weaknesses": "<what needs improvement>"
}

Focus specifically on the evaluation criteria for ${test.name}. Be thorough and provide actionable feedback.
`

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an expert AI system prompt evaluator. Provide detailed, actionable feedback in valid JSON format.",
            },
            {
              role: "user",
              content: evaluationPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        })

        const response = completion.choices[0]?.message?.content
        if (response) {
          try {
            // Try to parse as JSON, fallback to structured text if needed
            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              results[test.id] = JSON.parse(jsonMatch[0])
            } else {
              // Fallback structure if JSON parsing fails
              results[test.id] = {
                score: 75,
                analysis: response,
                suggestions: "See analysis for detailed feedback",
                strengths: "Analysis provided above",
                weaknesses: "See suggestions in analysis",
              }
            }
          } catch (parseError) {
            // Fallback if JSON parsing fails
            results[test.id] = {
              score: 70,
              analysis: response,
              suggestions: "Review the analysis for improvement areas",
              strengths: "Detailed in analysis",
              weaknesses: "Detailed in analysis",
            }
          }
        }
      } catch (testError) {
        console.error(`Error running evaluation ${test.id}:`, testError)
        results[test.id] = {
          score: 0,
          analysis: "Error occurred during evaluation",
          suggestions: "Please try again",
          strengths: "Unable to evaluate",
          weaknesses: "Evaluation failed",
        }
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error running evaluations:", error)
    return NextResponse.json({ error: "Failed to run evaluations" }, { status: 500 })
  }
}
