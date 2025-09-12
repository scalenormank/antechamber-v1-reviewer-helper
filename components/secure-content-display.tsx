import React from 'react'
import { escapeHtml, stripScripts } from '@/lib/input-validation'

interface SecureContentDisplayProps {
  content: string
  className?: string
  as?: 'div' | 'span' | 'p' | 'pre'
  preserveWhitespace?: boolean
}

export function SecureContentDisplay({ 
  content, 
  className = '', 
  as: Component = 'div',
  preserveWhitespace = false 
}: SecureContentDisplayProps) {
  // First strip any script tags and dangerous content
  const strippedContent = stripScripts(content)
  
  // Then escape HTML entities to prevent XSS
  const escapedContent = escapeHtml(strippedContent)
  
  // Handle whitespace preservation
  const finalContent = preserveWhitespace 
    ? escapedContent.replace(/\n/g, '<br />')
    : escapedContent

  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={{ __html: finalContent }}
    />
  )
}

interface SecureTextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  rows?: number
}

export function SecureTextArea({ 
  value, 
  onChange, 
  placeholder = '', 
  className = '', 
  id,
  rows = 4 
}: SecureTextAreaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value
    
    // Strip dangerous content before updating state
    const sanitizedValue = stripScripts(inputValue)
    
    onChange(sanitizedValue)
  }

  return (
    <textarea
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
    />
  )
}

interface SecureInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  type?: string
}

export function SecureInput({ 
  value, 
  onChange, 
  placeholder = '', 
  className = '', 
  id,
  type = 'text'
}: SecureInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Strip dangerous content before updating state
    const sanitizedValue = stripScripts(inputValue)
    
    onChange(sanitizedValue)
  }

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  )
}
