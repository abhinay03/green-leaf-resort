"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "./input"
import { ComponentProps } from "react"

const EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'aol.com',
  'protonmail.com',
  'icloud.com',
  'mail.com',
  'zoho.com',
  'yandex.com'
]

interface EmailInputProps extends Omit<ComponentProps<'input'>, 'onChange' | 'value' | 'type'> {
  value: string
  onChange: (value: string) => void
}

export function EmailInput({ value, onChange, ...props }: EmailInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)

    const atIndex = inputValue.lastIndexOf('@')
    
    if (atIndex !== -1) {
      const inputBeforeAt = inputValue.substring(0, atIndex)
      const domainStart = inputValue.substring(atIndex + 1).toLowerCase()
      
      const filtered = EMAIL_DOMAINS
        .filter(domain => domain.startsWith(domainStart))
        .map(domain => `${inputBeforeAt}@${domain}`)
      
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setCursor(-1)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setCursor(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setCursor(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (cursor >= 0 && cursor < suggestions.length) {
          handleSuggestionClick(suggestions[cursor])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
      default:
        break
    }
  }

  // Handle tab key to complete the first suggestion
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[0])
    }
  }

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="email"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => value.includes('@') && setShowSuggestions(suggestions.length > 0)}
        {...props}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                cursor === index ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
