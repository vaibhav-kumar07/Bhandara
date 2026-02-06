'use server'
import { connectToDatabase,  } from "@/lib/shared/db"
import { StatsService } from "@/lib/stats/stats.service"

export async function getOverallStats(){
  try {
    await connectToDatabase()
    const stats = await StatsService.getStats()
    return stats
  } catch (error) {
    console.error('GET /api/stats error:', error)
    return {
      success: false,
      error: 'Failed to fetch stats'
    }
    
  }
}
