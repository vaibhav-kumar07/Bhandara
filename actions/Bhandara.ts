'use server'
import { connectToDatabase } from "@/lib/shared/db"
import { BhandaraService } from "@/lib/bhandara/bhandara.service"
import { getStats } from "@/lib/stats/stats.service"

export async function createBhandara({name, date}: {name: string, date: string}) {
    try {
        await connectToDatabase()
        
        const bhandara = await BhandaraService.createBhandara({
            name,
            date
        })
        
        return {
            success: true,
            bhandaraId: bhandara.id,
            bhandara: bhandara,
            message: 'Bhandara created successfully'
        }
    } catch (error: any) {
        console.error('Error creating bhandara:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function updateBhandara({ id, name, date }: { id: string, name?: string, date?: string }) {
    try {
        await connectToDatabase()
        
        const updateData: { name?: string; date?: string } = {}
        if (name !== undefined) updateData.name = name
        if (date !== undefined) updateData.date = date
        
        const bhandara = await BhandaraService.updateBhandara(id, updateData)
        
        return {
            success: true,
            bhandara: bhandara,
            message: 'Bhandara updated successfully'
        }
    } catch (error: any) {
        console.error('Error updating bhandara:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function getAllBhandarasWithStats() {
    try {
        await connectToDatabase()
        
        const bhandaras = await BhandaraService.getAllBhandaras()
        
        // If no bhandaras, return empty array
        if (!bhandaras || bhandaras.length === 0) {
            return {
                success: true,
                bhandaras: []
            }
        }
        
        // Try to get stats, but don't fail if stats service fails
        let stats = null
        try {
            stats = await getStats()
        } catch (statsError) {
            console.error('Error fetching stats (continuing without stats):', statsError)
        }
        
        // Create a map of stats by bhandara ID
        const statsMap = new Map()
        if (stats && stats.bhandaras && Array.isArray(stats.bhandaras)) {
            stats.bhandaras.forEach((stat: any) => {
                statsMap.set(stat.bhandaraId, stat)
            })
        }
        
        // Merge bhandaras with their stats
        const bhandarasWithStats = bhandaras.map(bhandara => {
            const stat = statsMap.get(bhandara.id) || {
                totalCollected: 0,
                totalPending: 0,
                totalDonations: 0,
                donorCount: 0,
                paymentModeBreakdown: {
                    cash: 0,
                    upi: 0,
                    bank: 0
                }
            }
            
            return {
                ...bhandara,
                ...stat
            }
        })
        
        // Sort by date (newest first)
        bhandarasWithStats.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
        
        return {
            success: true,
            bhandaras: bhandarasWithStats
        }
    } catch (error: any) {
        console.error('Error fetching bhandaras with stats:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred',
            bhandaras: []
        }
    }   
}
export async function deleteBhandara({ id }: { id: string }) {
    try {
        await connectToDatabase()
        
        await BhandaraService.deleteBhandara(id)
        
        return {
            success: true,
            message: 'Bhandara deleted successfully'
        }
    } catch (error: any) {
        console.error('Error deleting bhandara:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

