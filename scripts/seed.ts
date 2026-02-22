#!/usr/bin/env tsx

import { runSeed } from '../lib/seed'

async function main() {
  console.log('🚀 Running database seed script...')
  
  try {
    await runSeed()
    console.log('🎉 Seed script completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Seed script failed:', error)
    process.exit(1)
  }
}

main()