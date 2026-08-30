import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Leaf, Flower2, Heart } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { thingsToDoService } from '../services/thingsToDoService'
import type { Activity } from '../types/thingsToDo'
import { ActivityCard } from '../components/thingstodo/ActivityCard'
import { ActivityComposer } from '../components/thingstodo/ActivityComposer'
import { useCurrentProfile } from '../hooks/useCurrentProfile'

type Tab = 'To Do' | 'Completed' | 'Favourites'

export function ThingsToDo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('To Do')
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [composerData, setComposerData] = useState<{ isOpen: boolean, activity?: Activity }>({ isOpen: searchParams.get('compose') === 'true' })
  const { profile } = useCurrentProfile()

  useEffect(() => {
    if (searchParams.get('compose') === 'true') {
      // clear the param from the URL cleanly so it doesn't reopen on refresh
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const data = await thingsToDoService.getActivities()
      setActivities(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (insert: any) => {
    await thingsToDoService.createActivity(insert)
    await loadActivities()
  }

  const handleUpdate = async (insert: any) => {
    if (composerData.activity) {
      await thingsToDoService.updateActivity(composerData.activity.id, insert)
      await loadActivities()
    }
  }

  const handleComplete = async (id: string) => {
    if (!profile?.id) return
    await thingsToDoService.completeActivity(id, profile.id)
    await loadActivities()
  }

  const handleUncomplete = async (id: string) => {
    await thingsToDoService.uncompleteActivity(id)
    await loadActivities()
  }

  const handleToggleFavourite = async (id: string, isFavourite: boolean) => {
    await thingsToDoService.toggleFavourite(id, isFavourite)
    await loadActivities()
  }

  const handleDelete = async (id: string) => {
    await thingsToDoService.deleteActivity(id)
    await loadActivities()
  }

  const filteredActivities = activities.filter(a => {
    if (activeTab === 'To Do') return !a.isCompleted
    if (activeTab === 'Completed') return a.isCompleted
    if (activeTab === 'Favourites') return a.isFavourite
    return true
  })

  return (
    <div className="w-full min-h-screen bg-warmPaper pt-safe flex flex-col relative">
      
      {/* Subtle Background Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-sunflower/15 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-lavender-soft/20 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="px-5 pt-8 pb-4 relative z-10 shrink-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[1.7rem] font-serif text-deepPlum font-medium tracking-tight">Things to do together</h1>
            <Leaf className="w-5 h-5 text-sage/70 -rotate-12" />
          </div>
          <p className="text-deepPlum/60 text-sm font-sans italic mb-4">"little things we want to do together"</p>
          
          <button 
            onClick={() => setComposerData({ isOpen: true })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-lavender-soft/40 shadow-sm text-lavender-dark hover:bg-lavender-mist rounded-full text-[15px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add something
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-blush/20 p-1.5 rounded-full shadow-inner gap-1">
          {(['To Do', 'Completed', 'Favourites'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[14px] font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-white text-deepPlum shadow-sm border border-black/5' 
                  : 'text-deepPlum/60 hover:text-deepPlum/80 hover:bg-white/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 relative px-5 z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-lavender-dark/30 border-t-lavender-dark rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 pb-8"
            >
              {filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center text-center py-20 px-4 bg-white/40 rounded-3xl border border-blush/20 shadow-sm mt-4">
                  {activeTab === 'To Do' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-sunflower/20 flex items-center justify-center mb-4">
                        <Flower2 className="w-6 h-6 text-sunflower" />
                      </div>
                      <h3 className="font-serif text-xl text-deepPlum font-medium mb-1.5">Things we could do together</h3>
                      <p className="text-deepPlum/60 font-sans text-sm mb-6 max-w-[240px]">
                        Nothing here yet — add the first little plan.
                      </p>
                      <button 
                        onClick={() => setComposerData({ isOpen: true })}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-lavender-dark text-white shadow-sm hover:bg-lavender-deep rounded-full text-[15px] font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add something
                      </button>
                    </>
                  )}
                  {activeTab === 'Completed' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-4">
                        <Leaf className="w-6 h-6 text-sage" />
                      </div>
                      <h3 className="font-serif text-xl text-deepPlum font-medium mb-1.5">Nothing checked off yet.</h3>
                      <p className="text-deepPlum/60 font-sans text-sm max-w-[240px]">
                        Memories of the things we've done will appear here.
                      </p>
                    </>
                  )}
                  {activeTab === 'Favourites' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-dustyRose/10 flex items-center justify-center mb-4">
                        <Heart className="w-6 h-6 text-dustyRose" />
                      </div>
                      <h3 className="font-serif text-xl text-deepPlum font-medium mb-1.5">Keep the things you really want to do here.</h3>
                      <button 
                        onClick={() => setActiveTab('To Do')}
                        className="inline-flex items-center mt-4 text-sm font-medium text-lavender-deep bg-lavender-soft/20 px-4 py-2 rounded-full"
                      >
                        View To Do list
                      </button>
                    </>
                  )}
                </div>
              ) : (
                filteredActivities.map(activity => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    onComplete={handleComplete}
                    onUncomplete={handleUncomplete}
                    onToggleFavourite={handleToggleFavourite}
                    onDelete={handleDelete}
                    onEdit={(act) => setComposerData({ isOpen: true, activity: act })}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {composerData.isOpen && (
          <ActivityComposer 
            initialData={composerData.activity}
            onClose={() => setComposerData({ isOpen: false })}
            onSubmit={composerData.activity ? handleUpdate : handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
