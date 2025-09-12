// Input validation and sanitization utilities
export interface ValidationResult {
  isValid: boolean
  sanitizedInput: string
  errors: string[]
}

export interface SecurityConfig {
  maxLength: number
  allowedCharacters: RegExp
  blockedPatterns: RegExp[]
  maxRequestsPerMinute: number
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxLength: 50000, // 50KB max per input field
  allowedCharacters: /^[\x20-\x7E\s\n\r\t]*$/, // Printable ASCII + whitespace
  blockedPatterns: [
    // Prompt injection patterns
    /ignore\s+(previous|above|all)\s+(instructions?|prompts?|rules?)/i,
    /forget\s+(everything|all|previous)/i,
    /you\s+are\s+now\s+(a|an)\s+/i,
    /pretend\s+to\s+be/i,
    /act\s+as\s+(if\s+)?(you\s+are\s+)?/i,
    /roleplay\s+as/i,
    /system\s*:\s*/i,
    /assistant\s*:\s*/i,
    /user\s*:\s*/i,
    /<\|.*?\|>/g, // Special tokens
    /\[\[.*?\]\]/g, // Bracket patterns
    /```.*?```/gs, // Code blocks
    /<script.*?>.*?<\/script>/gis, // Script tags
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    // System prompt manipulation attempts
    /system\s+prompt/i,
    /override\s+(system|prompt)/i,
    /bypass\s+(safety|security|guardrails)/i,
    /ignore\s+(safety|security|guardrails)/i,
    // Direct instruction attempts
    /return\s+only\s+the\s+(json|result|answer)/i,
    /don't\s+(include|show|display)/i,
    /hide\s+(this|that|the)/i,
    // Token manipulation
    /<\|endoftext\|>/i,
    /<\|startoftext\|>/i,
    /<\|assistant\|>/i,
    /<\|user\|>/i,
    /<\|system\|>/i,
  ],
  maxRequestsPerMinute: 10
}

// Rate limiting store (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function validateInput(
  input: string,
  fieldName: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): ValidationResult {
  const errors: string[] = []
  let sanitizedInput = input

  // Check if input exists
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      sanitizedInput: '',
      errors: [`${fieldName} is required and must be a string`]
    }
  }

  // Check length
  if (input.length > config.maxLength) {
    errors.push(`${fieldName} exceeds maximum length of ${config.maxLength} characters`)
    sanitizedInput = input.substring(0, config.maxLength)
  }

  // Check for allowed characters only
  if (!config.allowedCharacters.test(input)) {
    errors.push(`${fieldName} contains invalid characters`)
    // Remove non-printable characters
    sanitizedInput = input.replace(/[^\x20-\x7E\s\n\r\t]/g, '')
  }

  // Check for blocked patterns
  for (const pattern of config.blockedPatterns) {
    if (pattern.test(input)) {
      errors.push(`${fieldName} contains potentially malicious content (pattern: ${pattern.source})`)
      // Remove the matched content
      sanitizedInput = sanitizedInput.replace(pattern, '[REDACTED]')
    }
  }

  // Additional security checks
  if (input.includes('```') && input.split('```').length > 3) {
    errors.push(`${fieldName} contains excessive code blocks`)
  }

  // Check for excessive repetition (potential DoS)
  const words = input.split(/\s+/)
  const wordCounts = new Map<string, number>()
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
  }
  
  for (const [word, count] of wordCounts) {
    if (count > 100) {
      errors.push(`${fieldName} contains excessive repetition of "${word}"`)
      break
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedInput,
    errors
  }
}

export function checkRateLimit(
  clientId: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): boolean {
  const now = Date.now()
  const clientData = requestCounts.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (clientData.count >= config.maxRequestsPerMinute) {
    return false
  }
  
  clientData.count++
  return true
}

export function sanitizeForPrompt(input: string): string {
  // Additional sanitization specifically for LLM prompts
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\n{10,}/g, '\n\n') // Limit excessive newlines
    .replace(/\s{5,}/g, ' ') // Limit excessive spaces
    .trim()
}

export function validateApiRequest(
  body: any,
  requiredFields: string[],
  clientId: string = 'anonymous'
): { isValid: boolean; errors: string[]; sanitizedBody: any } {
  const errors: string[] = []
  const sanitizedBody: any = {}

  // Check rate limiting
  if (!checkRateLimit(clientId)) {
    errors.push('Rate limit exceeded. Please try again later.')
    return { isValid: false, errors, sanitizedBody: {} }
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!body[field]) {
      errors.push(`Missing required field: ${field}`)
      continue
    }

    // Validate and sanitize each field
    const validation = validateInput(body[field], field)
    if (!validation.isValid) {
      errors.push(...validation.errors)
    }
    sanitizedBody[field] = validation.sanitizedInput
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedBody
  }
}
