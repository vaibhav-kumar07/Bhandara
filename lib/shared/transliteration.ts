/**
 * Transliteration utility for converting English names to Hindi (Devanagari script)
 * Uses @ai4bharat/indic-transliterate package
 * 
 * Install the package: npm install --save @ai4bharat/indic-transliterate
 */

let transliterateModule: any = null

/**
 * Lazy load the transliteration module
 * This avoids import errors if the package isn't installed yet
 */
async function loadTransliterateModule() {
  if (transliterateModule) return transliterateModule
  
  try {
    transliterateModule = await import('@ai4bharat/indic-transliterate')
    return transliterateModule
  } catch (error) {
    console.warn('@ai4bharat/indic-transliterate not installed. Install it with: npm install --save @ai4bharat/indic-transliterate --legacy-peer-deps')
    return null
  }
}

/**
 * Converts English text to Hindi (Devanagari script)
 * @param text - English text to transliterate
 * @param options - Options for transliteration
 * @returns Promise<string> - Hindi text in Devanagari script, or original text if transliteration fails
 * 
 * @example
 * const hindiName = await toHindi('John')
 * // Returns: 'जॉन'
 */
export async function toHindi(
  text: string,
  options: { numOptions?: number } = {}
): Promise<string> {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return text
  }

  try {
    const module = await loadTransliterateModule()
    if (!module) {
      return text // Return original if package not installed
    }

    const { getTransliterateSuggestions } = module
    
    // Call the API - it returns an array of suggestions
    const suggestions = await getTransliterateSuggestions(text.trim(), {
      numOptions: options.numOptions || 1,
      lang: 'hi' // Hindi language code
    })

    // getTransliterateSuggestions returns an array of suggestions
    // Return the first (most likely) suggestion
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      return suggestions[0]
    }
    
    // If it's already a string (unlikely but handle it)
    if (typeof suggestions === 'string') {
      return suggestions
    }

    return text // Fallback to original text
  } catch (error) {
    console.error('Transliteration error for text:', text, error)
    return text // Return original text on error
  }
}

/**
 * Converts multiple English texts to Hindi in batch
 * Useful for processing multiple names at once
 * @param texts - Array of English texts to transliterate
 * @param options - Options for transliteration
 * @returns Promise<string[]> - Array of Hindi texts
 * 
 * @example
 * const hindiNames = await toHindiBatch(['John', 'Ramesh', 'Kumar'])
 * // Returns: ['जॉन', 'रमेश', 'कुमार']
 */
export async function toHindiBatch(
  texts: string[],
  options: { numOptions?: number } = {}
): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) {
    return texts
  }

  try {
    // Process in parallel for better performance
    const results = await Promise.all(
      texts.map(text => toHindi(text, options))
    )
    return results
  } catch (error) {
    console.error('Batch transliteration error:', error)
    return texts // Return original texts on error
  }
}

/**
 * Converts a donor object's names to Hindi
 * @param donor - Object with firstName and lastName properties
 * @param options - Options for transliteration
 * @returns Promise with donor object containing Hindi names
 * 
 * @example
 * const donor = { firstName: 'John', lastName: 'Doe' }
 * const hindiDonor = await convertDonorNamesToHindi(donor)
 * // Returns: { firstName: 'जॉन', lastName: 'डो' }
 */
export async function convertDonorNamesToHindi(
  donor: { firstName: string; lastName?: string },
  options: { numOptions?: number } = {}
): Promise<{ firstName: string; lastName: string }> {
  const [hindiFirstName, hindiLastName] = await Promise.all([
    toHindi(donor.firstName, options),
    donor.lastName ? toHindi(donor.lastName, options) : Promise.resolve('')
  ])

  return {
    firstName: hindiFirstName,
    lastName: hindiLastName
  }
}

