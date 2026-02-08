/**
 * Example usage of transliteration in Excel upload context
 * This file demonstrates how to use the transliteration utility
 */

import { toHindi, toHindiBatch, convertDonorNamesToHindi } from './transliteration'
import type { ProcessedDonorData } from '@/actions/UploadExcel'

/**
 * Example: Convert a single donor's names to Hindi
 */
export async function exampleConvertSingleDonor() {
  const donor = {
    firstName: 'John',
    lastName: 'Doe'
  }

  const hindiDonor = await convertDonorNamesToHindi(donor)
  console.log('English:', donor)
  console.log('Hindi:', hindiDonor)
  // Output:
  // English: { firstName: 'John', lastName: 'Doe' }
  // Hindi: { firstName: 'जॉन', lastName: 'डो' }
}

/**
 * Example: Convert multiple donor names from Excel data
 * This can be used in your UploadExcelModal component
 */
export async function convertDonorDataToHindi(
  donorData: ProcessedDonorData[]
): Promise<Array<ProcessedDonorData & { hindiFirstName?: string; hindiLastName?: string }>> {
  const results = await Promise.all(
    donorData.map(async (donor) => {
      const hindiNames = await convertDonorNamesToHindi({
        firstName: donor.firstName,
        lastName: donor.lastName
      })

      return {
        ...donor,
        hindiFirstName: hindiNames.firstName,
        hindiLastName: hindiNames.lastName
      }
    })
  )

  return results
}

/**
 * Example: Convert names in bulk (faster for large datasets)
 */
export async function exampleBulkConversion() {
  const names = ['John', 'Ramesh', 'Kumar', 'Priya', 'Amit']
  const hindiNames = await toHindiBatch(names)
  console.log('English names:', names)
  console.log('Hindi names:', hindiNames)
  // Output:
  // English names: ['John', 'Ramesh', 'Kumar', 'Priya', 'Amit']
  // Hindi names: ['जॉन', 'रमेश', 'कुमार', 'प्रिया', 'अमित']
}

/**
 * Usage in UploadExcelModal component:
 * 
 * import { convertDonorDataToHindi } from '@/lib/shared/transliteration-example'
 * 
 * // After parsing Excel file
 * const { data: processedData } = await parseExcelFile(selectedFile)
 * 
 * // Convert to Hindi (optional - can be done on demand)
 * const hindiData = await convertDonorDataToHindi(processedData)
 * 
 * // Now you can display both English and Hindi names in the UI
 * // or store both versions in the database
 */

