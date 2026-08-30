export interface Activity {
  id: string
  relationshipId: string
  title: string
  description?: string
  targetDate?: string // ISO date string
  createdBy: string
  completedBy?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  isCompleted: boolean
  isFavourite: boolean
}

export type ActivityInsert = Omit<Activity, 'id' | 'relationshipId' | 'createdAt' | 'updatedAt' | 'completedAt' | 'completedBy' | 'isCompleted'>
