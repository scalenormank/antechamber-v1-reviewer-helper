"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, CheckCircle, ImageIcon, X, CheckSquare, RotateCcw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TOOL_CATEGORIES = {
  "Device & System Control": [
    "get_system_settings",
    "set_system_settings",
    "get_cellular_status",
    "get_wifi_status",
    "get_location_service_status",
    "get_low_battery_mode_status",
    "set_cellular_status",
    "set_wifi_status",
    "set_location_service_status",
    "set_low_battery_mode_status",
    "set_locale",
  ],
  "Location & Navigation": [
    "search_place",
    "place_details",
    "get_directions",
    "convert_place_id_lat_lon_address",
    "search_place_and_specify_return_fields",
    "place_details_and_specify_return_fields",
    "search_place_and_return_address",
    "search_place_and_return_name",
    "search_place_and_return_place_id",
    "search_place_and_return_geometry",
    "place_details_and_return_geometry",
    "place_details_and_return_address",
    "place_details_and_return_reservable",
    "place_details_and_return_phone_number",
    "get_current_location",
    "get_current_location_field",
  ],
  "Calendar & Productivity": [
    "create_calendar",
    "search_calendars",
    "modify_calendar",
    "remove_calendar",
    "create_calendar_event",
    "search_calendar_events",
    "modify_calendar_event",
    "remove_calendar_event",
  ],
  "Information & Web Search": ["web_search", "scrape_webpage", "weather_forecast", "search_events"],
  "Entertainment & Media (Spotify)": [
    "search_spotify_top_results",
    "search_spotify_albums",
    "search_spotify_artists",
    "search_spotify_tracks",
    "search_spotify_playlists",
    "search_spotify_podcasts",
    "search_spotify_genres",
    "search_spotify_episodes",
    "spotify_album_details",
    "spotify_artist_profile",
    "spotify_track_credits",
    "spotify_playlist_tracks",
  ],
  "Time & Date": ["get_current_iso_8601_datetime_with_utc_offset", "iso_8601_datetime_with_utc_offset_to_iso_weekday"],
  "Finance & Investing": [
    "get_market_tickers",
    "search_securities",
    "get_market_quotes",
    "get_market_quotes_snapshots",
    "get_stock_history",
    "screen_stocks",
    "get_stock_modules",
    "get_insider_trades",
    "get_market_news",
  ],
  "E-commerce & Local Business": [
    "product_search",
    "product_details",
    "product_reviews",
    "seller_profile",
    "seller_reviews",
    "seller_products",
    "get_product_categories",
    "business_details",
    "business_reviews",
    "business_menu",
    "business_popular_dishes",
    "search_yelp",
  ],
  "Social Media & Community (Reddit)": ["search_reddit", "get_subreddit_posts", "get_post_details"],
  "News & Information": [
    "get_latest_news",
    "get_world_news",
    "get_business_news",
    "get_entertainment_news",
    "get_health_news",
    "get_science_news",
    "get_sport_news",
    "get_technology_news",
    "search_news",
    "get_search_suggestions",
  ],
  "Holidays & Culture": ["get_country_holidays_by_year", "get_supported_country_codes"],
}

const CONTEXT_INFO_REQUIREMENTS = [
  {
    id: "1",
    name: "Context Info re: system settings",
    description: "Information about current system configuration and device settings",
  },
  {
    id: "2",
    name: "Persona - Tone, language, style, attitude, and personality of the chatbot",
    description: "Define the AI's communication style and personality traits",
  },
  {
    id: "3",
    name: "Tool Usage Instructions / preferences",
    description: "Guidelines for when and how to use available tools",
  },
  {
    id: "4",
    name: "User Preferences",
    description: "Specific user preferences and customization settings",
  },
  {
    id: "5",
    name: "Background Info re: User",
    description: "Relevant background information about the user's context",
  },
  {
    id: "6",
    name: "This system prompt is unique and original (I have not repeated the system prompt from previous tasks)",
    description: "Ensures originality and uniqueness of the generated prompt",
  },
]

const COMPLEXITY_REQUIREMENTS = [
  {
    id: "1",
    name: "Provide Context Information about Applications and Entities the user is currently working with",
    description: "Help the model understand current app usage and relevant information",
  },
  {
    id: "2",
    name: "Define Personality and Tone",
    description: "Control the model's character for consistent user experience",
  },
  {
    id: "3",
    name: "Inject Critical, Non-Negotiable Facts",
    description: "Information the model must treat as absolute truth",
  },
  {
    id: "4",
    name: "Guide Tool Use and Response Formatting",
    description: "Clear instructions on when to use tools and how to format responses",
  },
  {
    id: "5",
    name: "Set Clear Guardrails and Safety Protocols",
    description: "Implement strict rules to prevent legal issues and ensure safety",
  },
  {
    id: "6",
    name: "Implement Dynamic Behavior Scaling",
    description: "Adapt approach based on perceived complexity of requests",
  },
  {
    id: "7",
    name: "Instruct Critical Evaluation of User Input",
    description: "Prevent blindly accepting user statements or corrections",
  },
]

const EVALUATION_TESTS = [
  {
    id: "1",
    name: "Clarity & Specificity Test",
    description: "Evaluates if instructions are clear, specific, and unambiguous",
    category: "Core Quality",
  },
  {
    id: "2",
    name: "Tool Usage Validation",
    description: "Checks if tool usage instructions are comprehensive and accurate",
    category: "Functionality",
  },
  {
    id: "3",
    name: "Safety & Guardrails Assessment",
    description: "Verifies presence of safety protocols and ethical guidelines",
    category: "Safety",
  },
  {
    id: "4",
    name: "Persona Consistency Check",
    description: "Analyzes personality definition and tone consistency",
    category: "Personality",
  },
  {
    id: "5",
    name: "Context Integration Test",
    description: "Evaluates how well context information is integrated",
    category: "Context",
  },
  {
    id: "6",
    name: "Response Format Validation",
    description: "Checks if response formatting guidelines are clear",
    category: "Formatting",
  },
  {
    id: "7",
    name: "Edge Case Handling",
    description: "Tests coverage of edge cases and error scenarios",
    category: "Robustness",
  },
  {
    id: "8",
    name: "Complexity Scaling Test",
    description: "Evaluates dynamic behavior scaling capabilities",
    category: "Adaptability",
  },
]

const IMAGE_CATEGORIES = [
  {
    id: "1",
    name: "UI Components",
    checkboxes: [
      { id: "1", name: "Buttons", imageUrl: "/modern-button-designs.jpg" },
      { id: "2", name: "Forms", imageUrl: "/elegant-form-layouts.jpg" },
      { id: "3", name: "Cards", imageUrl: "/card-component-designs.jpg" },
    ],
  },
  {
    id: "2",
    name: "Layout Patterns",
    checkboxes: [
      { id: "1", name: "Grid Systems", imageUrl: "/grid-layout-patterns.jpg" },
      { id: "2", name: "Navigation", imageUrl: "/navigation-menu-designs.jpg" },
      { id: "3", name: "Sidebars", imageUrl: "/sidebar-layout-designs.jpg" },
    ],
  },
  {
    id: "3",
    name: "Color Schemes",
    checkboxes: [
      { id: "1", name: "Dark Mode", imageUrl: "/dark-mode-color-palette.jpg" },
      { id: "2", name: "Light Mode", imageUrl: "/light-mode-color-palette.jpg" },
      { id: "3", name: "Gradients", imageUrl: "/gradient-color-schemes.jpg" },
    ],
  },
]

interface RequirementState {
  id: string
  selected: boolean
}

interface ImageCheckboxState {
  id: string
  selected: boolean
}

interface ImageCategoryState {
  id: string
  selected: boolean
  checkboxes: ImageCheckboxState[]
}

export function SystemPromptGenerator() {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("home")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [verificationResult, setVerificationResult] = useState("")
  const [promptSections, setPromptSections] = useState<{ [key: string]: string }>({})
  const [evaluationResults, setEvaluationResults] = useState<Record<string, any>>({})

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRunningEvals, setIsRunningEvals] = useState(false)

  // Form data
  const [systemSettingsJson, setSystemSettingsJson] = useState("")
  const [selectedToolCategories, setSelectedToolCategories] = useState<string[]>([])
  const [applicationContext, setApplicationContext] = useState("")
  const [userContext, setUserContext] = useState("")

  // Requirements state
  const [complexityRequirements, setComplexityRequirements] = useState<RequirementState[]>(
    COMPLEXITY_REQUIREMENTS.map((req) => ({ id: req.id, selected: true })),
  )
  const [contextInfoRequirements, setContextInfoRequirements] = useState<RequirementState[]>(
    CONTEXT_INFO_REQUIREMENTS.map((req) => ({ id: req.id, selected: true })),
  )
  const [evaluationTests, setEvaluationTests] = useState<RequirementState[]>(
    EVALUATION_TESTS.map((test) => ({ id: test.id, selected: false })),
  )

  // Image gallery state
  const [imageCategories, setImageCategories] = useState<ImageCategoryState[]>(
    IMAGE_CATEGORIES.map((cat) => ({
      id: cat.id,
      selected: false,
      checkboxes: cat.checkboxes.map((cb) => ({ id: cb.id, selected: false })),
    })),
  )
  const [selectedCategoryForOverlay, setSelectedCategoryForOverlay] = useState<string | null>(null)

  const [responseCheckerData, setResponseCheckerData] = useState({
    systemPrompt: "",
    userPrompt: "",
    toolCall: "",
    toolOutput: "",
    aiResponse: "",
  })
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorTypeResult, setErrorTypeResult] = useState<any>(null)
  const [isCheckingErrorType, setIsCheckingErrorType] = useState(false)

  const [verificationInput, setVerificationInput] = useState(generatedPrompt)

  const [checklistItems, setChecklistItems] = useState({
    // Overall Assessment
    taskRequirementsFulfilled: false,
    // System Prompt Evaluation
    systemPromptQuality: false,
    complexityPrinciples: false,
    buildingBlocks: false,
    bannedContentFree: false,
    // Conversation & Persona Consistency
    personaAdherence: false,
    conversationFlow: false,
    personaSpecificPrompts: false,
    // Error Identification & Correction
    errorHandling: false,
    systemPromptCompliance: false,
    // Tool Response Verification
    jsonGrounding: false,
    hallucinationFree: false,
    // General Quality
    overallQuality: false,
  })

  const toggleComplexityRequirement = (id: string) => {
    const selectedCount = complexityRequirements.filter((req) => req.selected).length
    const isCurrentlySelected = complexityRequirements.find((req) => req.id === id)?.selected

    if (!isCurrentlySelected && selectedCount >= 7) {
      toast({
        title: "Maximum Selection Reached",
        description: "You can select a maximum of 7 complexity requirements.",
        variant: "destructive",
      })
      return
    }

    setComplexityRequirements((prev) => prev.map((req) => (req.id === id ? { ...req, selected: !req.selected } : req)))
  }

  const toggleContextInfoRequirement = (id: string) => {
    const selectedCount = contextInfoRequirements.filter((req) => req.selected).length
    const isCurrentlySelected = contextInfoRequirements.find((req) => req.id === id)?.selected

    if (!isCurrentlySelected && selectedCount >= 6) {
      toast({
        title: "Maximum Selection Reached",
        description: "You can select a maximum of 6 context information requirements.",
        variant: "destructive",
      })
      return
    }

    setContextInfoRequirements((prev) => prev.map((req) => (req.id === id ? { ...req, selected: !req.selected } : req)))
  }

  const toggleToolCategory = (category: string) => {
    setSelectedToolCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleEvaluationTest = (id: string) => {
    setEvaluationTests((prev) => prev.map((test) => (test.id === id ? { ...test, selected: !test.selected } : test)))
  }

  const toggleImageCheckbox = (categoryId: string, checkboxId: string) => {
    setImageCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              checkboxes: category.checkboxes.map((cb) =>
                cb.id === checkboxId ? { ...cb, selected: !cb.selected } : cb,
              ),
            }
          : category,
      ),
    )
  }

  const generateManualPrompt = () => {
    const selectedComplexityReqs = complexityRequirements.filter((req) => req.selected)
    const selectedContextReqs = contextInfoRequirements.filter((req) => req.selected)
    const selectedTools = selectedToolCategories.flatMap((category) => TOOL_CATEGORIES[category])

    // Parse system settings
    let parsedSystemSettings = {}
    try {
      parsedSystemSettings =
        systemSettingsJson && systemSettingsJson.trim() !== "" && systemSettingsJson !== "{}"
          ? JSON.parse(systemSettingsJson)
          : {}
    } catch {
      parsedSystemSettings = {}
    }

    // Create structured template format
    const manualPrompt = `### **SYSTEM SETTINGS**
\`\`\`json
${JSON.stringify(parsedSystemSettings, null, 2)}
\`\`\`

### **APPLICATION USE CONTEXT**
\`\`\`
${applicationContext && applicationContext.trim() ? applicationContext : ""}
\`\`\`

### **AVAILABLE TOOLS/DOMAINS**
\`\`\`
${selectedTools.length > 0 ? selectedTools.join(", ") : "No specific tools selected"}
\`\`\`

### **COMPLEXITY REQUIREMENTS**
\`\`\`
${selectedComplexityReqs
  .map((req) => {
    const fullReq = COMPLEXITY_REQUIREMENTS.find((cr) => cr.id === req.id)
    return fullReq ? `${fullReq.id}. ${fullReq.name}` : ""
  })
  .filter(Boolean)
  .join("\n")}
\`\`\`

---

## Instructions for ChatGPT:

Copy the above template and paste it into ChatGPT with this prompt:

"Please create a sophisticated system prompt following the Advanced System Prompt Generator methodology using the template above. 

Follow this EXACT structure:

**PARAGRAPH 1:** Start with "You are [role/assistant type] for a user currently located at [full address from system settings]. [Integrate device settings naturally - wifi status, cellular, location services, battery mode, timezone]. [Brief context about user's situation]."

**PARAGRAPH 2:** Copy the APPLICATION USE CONTEXT exactly as provided word-for-word. Do not modify, interpret, or rephrase anything from the application context.

**REMAINING PARAGRAPHS:** Build the prompt using selected complexity requirements with specific tool usage rules, exact response formats, clear boundaries, and concrete examples.

Write in natural paragraphs (no bullet points or lists) and make it feel cohesive and professional."`

    return manualPrompt
  }

  const generateSystemPrompt = async () => {
    setIsGenerating(true)
    try {
      const selectedComplexityReqs = complexityRequirements.filter((req) => req.selected)
      const selectedContextReqs = contextInfoRequirements.filter((req) => req.selected)

      if (selectedComplexityReqs.length < 5 || selectedComplexityReqs.length > 7) {
        toast({
          title: "Invalid Complexity Requirements",
          description: "Please select between 5-7 complexity requirements.",
          variant: "destructive",
        })
        return
      }

      if (selectedContextReqs.length < 4 || selectedContextReqs.length > 6) {
        toast({
          title: "Invalid Context Requirements",
          description: "Please select between 4-6 context information requirements.",
          variant: "destructive",
        })
        return
      }

      const selectedTools = selectedToolCategories.flatMap((category) => TOOL_CATEGORIES[category])

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemSettings: systemSettingsJson || "{}",
          selectedTools,
          applicationContext: applicationContext || "",
          userContext: userContext || "",
          complexityRequirements: selectedComplexityReqs.map((req) =>
            COMPLEXITY_REQUIREMENTS.find((cr) => cr.id === req.id),
          ),
          contextInfoRequirements: selectedContextReqs.map((req) =>
            CONTEXT_INFO_REQUIREMENTS.find((cir) => cir.id === req.id),
          ),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate prompt")
      }

      const data = await response.json()
      setGeneratedPrompt(data.prompt)
      setPromptSections(data.sections || {})
      if (data.template) {
        setGeneratedPrompt(data.prompt)
      }

      toast({
        title: "System Prompt Generated",
        description: "Your system prompt has been successfully created.",
      })
    } catch (error) {
      console.error("Generation error:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      if (errorMessage.includes("API key") || errorMessage.includes("OpenAI")) {
        const manualPrompt = generateManualPrompt()
        setGeneratedPrompt(manualPrompt)

        toast({
          title: "API Not Available - Manual Template Generated",
          description:
            "The OpenAI API is not configured. A manual template has been generated for you to copy to ChatGPT.",
          variant: "default",
        })
      } else {
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const verifyPrompt = async () => {
    setIsVerifying(true)
    try {
      const textarea = document.getElementById("verification-input") as HTMLTextAreaElement
      const promptToVerify = textarea?.value || verificationInput

      const response = await fetch("/api/verify-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToVerify }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] API Error Response:", data)
        throw new Error(`API request failed: ${response.status} - ${data.error || "Unknown error"}`)
      }

      if (!data.evaluation) {
        throw new Error("Invalid response structure: missing evaluation")
      }

      setVerificationResult(data.evaluation)
      setPromptSections({})

      toast({
        title: "Verification Complete",
        description: "System prompt evaluation has been completed.",
      })
    } catch (error) {
      console.error("[v0] Verification Error:", error)
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify system prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const runEvaluations = async (promptToEvaluate: string) => {
    const selectedTests = evaluationTests.filter((test) => test.selected)

    if (selectedTests.length === 0) {
      toast({
        title: "No Evaluations Selected",
        description: "Please select at least one evaluation test to run.",
        variant: "destructive",
      })
      return
    }

    setIsRunningEvals(true)
    try {
      const response = await fetch("/api/run-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToEvaluate,
          evaluationTests: selectedTests.map((test) => EVALUATION_TESTS.find((et) => et.id === test.id)),
        }),
      })

      if (!response.ok) throw new Error("Failed to run evaluations")

      const data = await response.json()
      setEvaluationResults(data.results)

      toast({
        title: "Evaluations Complete",
        description: `${selectedTests.length} evaluation tests completed successfully.`,
      })
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: "Failed to run evaluations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRunningEvals(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard.",
    })
  }

  const openCategoryOverlay = (categoryId: string) => {
    setSelectedCategoryForOverlay(categoryId)
  }

  const closeCategoryOverlay = () => {
    setSelectedCategoryForOverlay(null)
  }

  const getSelectedComplexityCount = () => complexityRequirements.filter((req) => req.selected).length
  const getSelectedContextCount = () => contextInfoRequirements.filter((req) => req.selected).length
  const isValidSelection = () => {
    const complexityCount = getSelectedComplexityCount()
    const contextCount = getSelectedContextCount()
    return complexityCount >= 5 && complexityCount <= 7 && contextCount >= 4 && contextCount <= 6
  }

  const handleResponseCheckerChange = (field: string, value: string) => {
    setResponseCheckerData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const analyzeResponse = async () => {
    if (!responseCheckerData.systemPrompt || !responseCheckerData.userPrompt || !responseCheckerData.aiResponse) {
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseCheckerData),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      console.log("[v0] Analysis result:", result)

      if (result.error) {
        throw new Error(result.details || result.error)
      }

      // Validate the structure before setting
      if (!result.groundingCheck || !result.systemPromptIntegrityCheck || !result.responseCompletenessCheck) {
        throw new Error("Invalid analysis result structure")
      }

      setAnalysisResult(result)
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      setAnalysisResult({
        error: true,
        message: error instanceof Error ? error.message : "Analysis failed",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const checkErrorType = async () => {
    if (!responseCheckerData.systemPrompt || !responseCheckerData.userPrompt || !responseCheckerData.aiResponse) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in system prompt, user prompt, and AI response before checking error types.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingErrorType(true)
    try {
      const response = await fetch("/api/check-error-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseCheckerData),
      })

      if (!response.ok) {
        throw new Error("Error type analysis failed")
      }

      const result = await response.json()
      console.log("[v0] Error type result:", result)

      if (result.error) {
        throw new Error(result.details || result.error)
      }

      setErrorTypeResult(result)
      
      toast({
        title: "Error Type Analysis Complete",
        description: "Error types have been identified and analyzed.",
      })
    } catch (error) {
      console.error("[v0] Error type analysis error:", error)
      setErrorTypeResult({
        error: true,
        message: error instanceof Error ? error.message : "Error type analysis failed",
      })
      
      toast({
        title: "Error Type Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze error types",
        variant: "destructive",
      })
    } finally {
      setIsCheckingErrorType(false)
    }
  }

  const clearResponseChecker = () => {
    setResponseCheckerData({
      systemPrompt: "",
      userPrompt: "",
      toolCall: "",
      toolOutput: "",
      aiResponse: "",
    })
    setAnalysisResult(null)
    setErrorTypeResult(null)
  }

  const handleChecklistChange = (item: string) => {
    setChecklistItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

  const resetChecklist = () => {
    setChecklistItems({
      taskRequirementsFulfilled: false,
      systemPromptQuality: false,
      complexityPrinciples: false,
      buildingBlocks: false,
      bannedContentFree: false,
      personaAdherence: false,
      conversationFlow: false,
      personaSpecificPrompts: false,
      errorHandling: false,
      systemPromptCompliance: false,
      jsonGrounding: false,
      hallucinationFree: false,
      overallQuality: false,
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Full page overlay for image categories */}
      {selectedCategoryForOverlay && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl max-h-[90vh] bg-background border rounded-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">
                {IMAGE_CATEGORIES.find((cat) => cat.id === selectedCategoryForOverlay)?.name} Options
              </h2>
              <Button variant="ghost" size="sm" onClick={closeCategoryOverlay}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="p-6 max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {IMAGE_CATEGORIES.find((cat) => cat.id === selectedCategoryForOverlay)?.checkboxes.map((checkbox) => {
                  const categoryState = imageCategories.find((cat) => cat.id === selectedCategoryForOverlay)
                  const checkboxState = categoryState?.checkboxes.find((cb) => cb.id === checkbox.id)

                  return (
                    <div key={checkbox.id} className="space-y-3">
                      <div
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                          checkboxState?.selected ? "bg-accent border-primary" : "border-muted-foreground/20"
                        }`}
                        onClick={() => toggleImageCheckbox(selectedCategoryForOverlay, checkbox.id)}
                      >
                        <Checkbox checked={checkboxState?.selected || false} onChange={() => {}} />
                        <Label className="cursor-pointer font-medium">{checkbox.name}</Label>
                      </div>

                      {checkboxState?.selected && (
                        <div className="p-3 bg-muted/30 rounded-lg border">
                          <img
                            src={checkbox.imageUrl || "/placeholder.svg"}
                            alt={checkbox.name}
                            className="w-full rounded border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=200&width=300&text=" + encodeURIComponent(checkbox.name)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Bot className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Tool for Anti Chamber</h1>
        </div>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
          Advanced tools for AI system prompt analysis and evaluation.
        </p>
      </div>

      {/* Main Navigation Buttons */}
      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setActiveTab("verify")}>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Verify System Prompt</h3>
              <p className="text-muted-foreground">
                Analyze existing system prompts for completeness, quality, and effectiveness. Get detailed feedback on prompt structure and components.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setActiveTab("images")}>
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Response Checker</h3>
              <p className="text-muted-foreground">
                Analyze AI responses by providing system prompts, user prompts, tool calls, and outputs. Evaluate grounding, integrity, and completeness.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setActiveTab("checklist")}>
            <CardContent className="p-8 text-center">
              <CheckSquare className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Checklist</h3>
              <p className="text-muted-foreground">
                Use the systematic evaluation checklist to track progress across multiple quality dimensions and ensure comprehensive task completion.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back to Home Button */}
      {activeTab !== "home" && (
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      )}

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Prompt Verification</CardTitle>
              <CardDescription>
                Enter your system prompt below to get a comprehensive evaluation of its clarity, completeness, and
                effectiveness.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="verification-input" className="block text-sm font-medium mb-2">
                  System Prompt to Verify
                </label>
                <textarea
                  id="verification-input"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder="Paste your system prompt here for verification..."
                  className="w-full min-h-[200px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button onClick={verifyPrompt} disabled={isVerifying || !verificationInput.trim()} className="w-full">
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify System Prompt
                  </>
                )}
              </Button>

              {verificationResult && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{verificationResult}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Checker</CardTitle>
              <CardDescription>
                Analyze AI responses by providing the system prompt, user prompt, tool calls, tool outputs, and final
                response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="system-prompt" className="block text-sm font-medium mb-2">
                    System Prompt
                  </label>
                  <textarea
                    id="system-prompt"
                    placeholder="Enter the system prompt used..."
                    className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                    value={responseCheckerData.systemPrompt}
                    onChange={(e) => handleResponseCheckerChange("systemPrompt", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="user-prompt" className="block text-sm font-medium mb-2">
                    User Prompt
                  </label>
                  <textarea
                    id="user-prompt"
                    placeholder="Enter the user's prompt..."
                    className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                    value={responseCheckerData.userPrompt}
                    onChange={(e) => handleResponseCheckerChange("userPrompt", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="tool-call" className="block text-sm font-medium mb-2">
                    Tool Call
                  </label>
                  <textarea
                    id="tool-call"
                    placeholder="Enter the tool call made by the AI..."
                    className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                    value={responseCheckerData.toolCall}
                    onChange={(e) => handleResponseCheckerChange("toolCall", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="tool-output" className="block text-sm font-medium mb-2">
                    Tool Output
                  </label>
                  <textarea
                    id="tool-output"
                    placeholder="Enter the output returned by the tool..."
                    className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                    value={responseCheckerData.toolOutput}
                    onChange={(e) => handleResponseCheckerChange("toolOutput", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="ai-response" className="block text-sm font-medium mb-2">
                    AI Response
                  </label>
                  <textarea
                    id="ai-response"
                    placeholder="Enter the final AI response..."
                    className="w-full min-h-[120px] p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                    value={responseCheckerData.aiResponse}
                    onChange={(e) => handleResponseCheckerChange("aiResponse", e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={analyzeResponse} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "Analyze Response"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 hover:bg-accent hover:text-accent-foreground" 
                    onClick={checkErrorType} 
                    disabled={isCheckingErrorType}
                  >
                    {isCheckingErrorType ? "Checking..." : "Check Error Type"}
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={clearResponseChecker}>
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Analysis Results Display */}
              {analysisResult && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Analysis Results
                      {!analysisResult.error && (
                        <span className="text-sm font-normal bg-primary/10 px-2 py-1 rounded">
                          Score: {analysisResult.overallScore}/10
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisResult.error ? (
                      <div className="border rounded-lg p-4 bg-red-50">
                        <h4 className="font-medium text-red-800 mb-2">Analysis Failed</h4>
                        <p className="text-sm text-red-600">{analysisResult.message}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Grounding Check */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">Grounding Check</h4>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                analysisResult.groundingCheck.status === "pass"
                                  ? "bg-green-100 text-green-800"
                                  : analysisResult.groundingCheck.status === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {analysisResult.groundingCheck.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{analysisResult.groundingCheck.details}</p>
                          {analysisResult.groundingCheck.issues && analysisResult.groundingCheck.issues.length > 0 && (
                            <ul className="text-sm space-y-1">
                              {analysisResult.groundingCheck.issues.map((issue: string, index: number) => (
                                <li key={index} className="text-red-600">
                                  • {issue}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* System Prompt Integrity Check */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">System Prompt Integrity</h4>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                analysisResult.systemPromptIntegrityCheck.status === "pass"
                                  ? "bg-green-100 text-green-800"
                                  : analysisResult.systemPromptIntegrityCheck.status === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {analysisResult.systemPromptIntegrityCheck.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {analysisResult.systemPromptIntegrityCheck.details}
                          </p>
                          {analysisResult.systemPromptIntegrityCheck.issues &&
                            analysisResult.systemPromptIntegrityCheck.issues.length > 0 && (
                              <ul className="text-sm space-y-1">
                                {analysisResult.systemPromptIntegrityCheck.issues.map(
                                  (issue: string, index: number) => (
                                    <li key={index} className="text-red-600">
                                      • {issue}
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                        </div>

                        {/* Response Completeness Check */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">Response Completeness</h4>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                analysisResult.responseCompletenessCheck.status === "pass"
                                  ? "bg-green-100 text-green-800"
                                  : analysisResult.responseCompletenessCheck.status === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {analysisResult.responseCompletenessCheck.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {analysisResult.responseCompletenessCheck.details}
                          </p>
                          {analysisResult.responseCompletenessCheck.issues &&
                            analysisResult.responseCompletenessCheck.issues.length > 0 && (
                              <ul className="text-sm space-y-1">
                                {analysisResult.responseCompletenessCheck.issues.map((issue: string, index: number) => (
                                  <li key={index} className="text-red-600">
                                    • {issue}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>

                        {/* Overall Summary */}
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Summary</h4>
                          <p className="text-sm">{analysisResult.summary}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Error Type Analysis Results Display */}
              {errorTypeResult && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Error Type Analysis Results
                      {!errorTypeResult.error && (
                        <span className="text-sm font-normal bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {errorTypeResult.errorCount || 0} Error{errorTypeResult.errorCount !== 1 ? 's' : ''} Found
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {errorTypeResult.error ? (
                      <div className="border rounded-lg p-4 bg-red-50">
                        <h4 className="font-medium text-red-800 mb-2">Analysis Failed</h4>
                        <p className="text-sm text-red-600">{errorTypeResult.message}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Error Types List */}
                        {errorTypeResult.errorTypes && errorTypeResult.errorTypes.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-lg">Identified Error Types:</h4>
                            {errorTypeResult.errorTypes.map((errorType: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4 bg-orange-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium text-orange-800">{errorType.type}</h5>
                                  <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded">
                                    {errorType.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-orange-700 mb-2">{errorType.description}</p>
                                {errorType.examples && errorType.examples.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-orange-800 mb-1">Examples:</p>
                                    <ul className="text-sm text-orange-700 space-y-1">
                                      {errorType.examples.map((example: string, exIndex: number) => (
                                        <li key={exIndex} className="ml-4">• {example}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recommendations */}
                        {errorTypeResult.recommendations && errorTypeResult.recommendations.length > 0 && (
                          <div className="border rounded-lg p-4 bg-blue-50">
                            <h4 className="font-medium text-blue-800 mb-2">Recommendations:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {errorTypeResult.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="ml-4">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Summary */}
                        {errorTypeResult.summary && (
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Summary</h4>
                            <p className="text-sm">{errorTypeResult.summary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Task Feedback Checklist
              </CardTitle>
              <CardDescription>
                Use this checklist to systematically evaluate task quality and provide comprehensive feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Assessment */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Overall Assessment</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="taskRequirementsFulfilled"
                    checked={checklistItems.taskRequirementsFulfilled}
                    onChange={() => handleChecklistChange("taskRequirementsFulfilled")}
                    className="rounded"
                  />
                  <label htmlFor="taskRequirementsFulfilled" className="text-sm">
                    Task Requirements: All required categories completed. Double check if natural user category uses two
                    tools or more correctly.
                  </label>
                </div>
              </div>

              {/* System Prompt Evaluation */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">System Prompt Evaluation</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="systemPromptQuality"
                      checked={checklistItems.systemPromptQuality}
                      onChange={() => handleChecklistChange("systemPromptQuality")}
                      className="rounded"
                    />
                    <label htmlFor="systemPromptQuality" className="text-sm">
                      System Prompt Quality: Meets criteria for high-quality prompt
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="complexityPrinciples"
                      checked={checklistItems.complexityPrinciples}
                      onChange={() => handleChecklistChange("complexityPrinciples")}
                      className="rounded"
                    />
                    <label htmlFor="complexityPrinciples" className="text-sm">
                      Complexity Principles: Meets requirement (6/7 principles)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="buildingBlocks"
                      checked={checklistItems.buildingBlocks}
                      onChange={() => handleChecklistChange("buildingBlocks")}
                      className="rounded"
                    />
                    <label htmlFor="buildingBlocks" className="text-sm">
                      Building Blocks: Meets requirement (4/5 building blocks)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bannedContentFree"
                      checked={checklistItems.bannedContentFree}
                      onChange={() => handleChecklistChange("bannedContentFree")}
                      className="rounded"
                    />
                    <label htmlFor="bannedContentFree" className="text-sm">
                      Banned Content: Prompt is free from banned content
                    </label>
                  </div>
                </div>
              </div>

              {/* Conversation & Persona Consistency */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Conversation & Persona Consistency</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="personaAdherence"
                      checked={checklistItems.personaAdherence}
                      onChange={() => handleChecklistChange("personaAdherence")}
                      className="rounded"
                    />
                    <label htmlFor="personaAdherence" className="text-sm">
                      Persona Adherence: Consistent with assigned persona (Natural/Lazy User)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="conversationFlow"
                      checked={checklistItems.conversationFlow}
                      onChange={() => handleChecklistChange("conversationFlow")}
                      className="rounded"
                    />
                    <label htmlFor="conversationFlow" className="text-sm">
                      Conversation Flow: Logical, relevant, and includes 10+ user turns
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="personaSpecificPrompts"
                      checked={checklistItems.personaSpecificPrompts}
                      onChange={() => handleChecklistChange("personaSpecificPrompts")}
                      className="rounded"
                    />
                    <label htmlFor="personaSpecificPrompts" className="text-sm">
                      Persona-Specific Prompts: Natural User (3+ multi-tool calls) / Lazy User (vague first prompt)
                    </label>
                  </div>
                </div>
              </div>

              {/* Error Identification & Correction */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Error Identification & Correction</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="errorHandling"
                      checked={checklistItems.errorHandling}
                      onChange={() => handleChecklistChange("errorHandling")}
                      className="rounded"
                    />
                    <label htmlFor="errorHandling" className="text-sm">
                      Error Handling: Correctly identified and fixed errors. Verified hallucinated information and/or
                      invalid URLs.
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="systemPromptCompliance"
                      checked={checklistItems.systemPromptCompliance}
                      onChange={() => handleChecklistChange("systemPromptCompliance")}
                      className="rounded"
                    />
                    <label htmlFor="systemPromptCompliance" className="text-sm">
                      System Prompt Compliance: No guideline violations detected
                    </label>
                  </div>
                </div>
              </div>

              {/* Tool Response Verification */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Tool Response Verification</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="jsonGrounding"
                      checked={checklistItems.jsonGrounding}
                      onChange={() => handleChecklistChange("jsonGrounding")}
                      className="rounded"
                    />
                    <label htmlFor="jsonGrounding" className="text-sm">
                      JSON Grounding: All tool responses verified and grounded in JSON data
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hallucinationFree"
                      checked={checklistItems.hallucinationFree}
                      onChange={() => handleChecklistChange("hallucinationFree")}
                      className="rounded"
                    />
                    <label htmlFor="hallucinationFree" className="text-sm">
                      Hallucination-Free: No parameter or information hallucinations detected
                    </label>
                  </div>
                </div>
              </div>

              {/* General Quality */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">General Quality</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overallQuality"
                    checked={checklistItems.overallQuality}
                    onChange={() => handleChecklistChange("overallQuality")}
                    className="rounded"
                  />
                  <label htmlFor="overallQuality" className="text-sm">
                    Overall Quality: Task meets all quality standards and requirements
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={resetChecklist} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Reset Checklist
                </Button>
                <div className="flex-1" />
                <div className="text-sm text-muted-foreground">
                  {Object.values(checklistItems).filter(Boolean).length} of {Object.keys(checklistItems).length} items
                  completed
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
