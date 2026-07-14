'use client'

import { useState, useRef, useEffect } from 'react'
import { GraduationCap, Globe, CheckCircle2, MessageSquare, Clock, Building, Save, X, Wallet, FolderOpen, Send, Plus, Check } from 'lucide-react'
import { updateLeadDetails, createInteraction, toggleFileOpened } from '@/app/actions/leads'
import { createTask, updateTaskStatus } from '@/app/actions/tasks'
import { addLeadToBatchAction } from '@/app/actions/courses'

export default function LeadDetailClient({ lead, canEdit = true, courses = [] }: { lead: any, canEdit?: boolean, courses?: any[] }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    sscGroup: lead.sscGroup || '',
    sscYear: lead.sscYear || '',
    sscResult: lead.sscResult || '',
    hscGroup: lead.hscGroup || '',
    hscYear: lead.hscYear || '',
    hscResult: lead.hscResult || '',
    bachelorsMajor: lead.bachelorsMajor || '',
    bachelorsYear: lead.bachelorsYear || '',
    bachelorsCgpa: lead.bachelorsCgpa || '',
    mastersMajor: lead.mastersMajor || '',
    mastersYear: lead.mastersYear || '',
    mastersCgpa: lead.mastersCgpa || '',
    preferredStudyLevel: lead.preferredStudyLevel || '',
    preferredCountry: lead.preferredCountry || '',
    preferredCourse: lead.preferredCourse || '',
    preferredIntake: lead.preferredIntake || '',

    workExperience: lead.workExperience || '',
    englishTestStatus: lead.englishTestStatus || '',
    englishTestType: lead.englishTestType || '',
    englishTestScore: lead.englishTestScore || '',
    source: lead.source || '',
    budget: lead.budget || ''
  })

  // Timeline State
  const [noteContent, setNoteContent] = useState('')
  const [isPostingNote, setIsPostingNote] = useState(false)
  const [localInteractions, setLocalInteractions] = useState<any[]>(lead.interactions || [])
  const timelineContainerRef = useRef<HTMLDivElement>(null)

  // Sync interactions from props
  useEffect(() => {
    setLocalInteractions(lead.interactions || [])
  }, [lead.interactions])

  // File Opened State
  const [isFileOpened, setIsFileOpened] = useState(lead.isFileOpened || false)
  const [isPendingFileOpened, setIsPendingFileOpened] = useState(false)

  useEffect(() => {
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollTo({
        top: timelineContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [localInteractions, lead.initialNote])

  // Task State
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')

  // App State (now Enrollments)
  const [isAddingApp, setIsAddingApp] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')

  const [intakeMonth, setIntakeMonth] = useState(lead.preferredIntake?.split(' ')[0] || '')
  const [intakeYear, setIntakeYear] = useState(lead.preferredIntake?.split(' ')[1] || '')

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveDetails = async () => {
    const finalIntake = [intakeMonth, intakeYear].filter(Boolean).join(' ')
    const updatedData = { ...formData, preferredIntake: finalIntake }
    try {
      await updateLeadDetails(lead.id, updatedData)
      setFormData(updatedData)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePostNote = async () => {
    if (!noteContent.trim()) return
    const content = noteContent
    setNoteContent('')
    setIsPostingNote(true)

    const optimisticNote = {
      id: 'optimistic-' + Date.now(),
      content: content,
      createdAt: new Date().toISOString(),
      counselor: {
        fullName: 'Posting...',
        role: ''
      }
    }

    setLocalInteractions(prev => [...prev, optimisticNote])

    try {
      await createInteraction(lead.id, content)
    } catch (err) {
      setLocalInteractions(prev => prev.filter(n => n.id !== optimisticNote.id))
      setNoteContent(content)
    } finally {
      setIsPostingNote(false)
    }
  }

  const handleAddTask = async () => {
    if (!taskDescription || !taskDueDate) return
    const formDataObj = new FormData()
    formDataObj.append('description', taskDescription)
    formDataObj.append('dueDate', taskDueDate)
    formDataObj.append('counselorId', lead.assignedCounselorId || '')
    formDataObj.append('leadId', lead.id)

    try {
      await createTask(formDataObj)
      setTaskDescription('')
      setTaskDueDate('')
      setIsAddingTask(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending'
    try {
      await updateTaskStatus(taskId, newStatus)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddApp = async () => {
    if (!selectedBatch) return
    try {
      await addLeadToBatchAction(selectedBatch, lead.id)
      setSelectedCourse('')
      setSelectedBatch('')
      setIsAddingApp(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileOpenedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return
    const checked = e.target.checked
    setIsPendingFileOpened(true)
    try {
      await toggleFileOpened(lead.id, checked)
      setIsFileOpened(checked)
    } catch (err) {
      console.error(err)
    } finally {
      setIsPendingFileOpened(false)
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3E3E42] border-none rounded-sm py-2 px-3 text-xs font-semibold text-[#D4D4D4] placeholder-[#858585] focus:outline-none transition-all"
  const selectClass = "w-full bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] rounded-sm py-2 px-3 outline-none focus:border border-[#3E3E42] transition-all cursor-pointer"
  
  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Academic & Preferences */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* File Opened Status Card */}
          <div className={`neo-raised p-5 flex items-center justify-between transition-colors duration-300 ${
            isFileOpened ? 'bg-emerald-500/5 border border-[#3E3E42]' : ''
          }`}>
            <h3 className="text-sm font-bold text-[#D4D4D4] flex items-center gap-2">
              <FolderOpen className={`h-4.5 w-4.5 ${isFileOpened ? 'text-emerald-500' : 'text-[#858585]'}`} />
              File Opened Status
            </h3>
            <label className="flex items-center cursor-pointer gap-2">
              {isPendingFileOpened && <span className="text-[10px] text-[#858585] animate-pulse font-bold">Saving...</span>}
              <input 
                type="checkbox" 
                checked={isFileOpened}
                onChange={handleFileOpenedChange}
                disabled={isPendingFileOpened || !canEdit}
                className="w-5 h-5 rounded cursor-pointer accent-emerald-500"
              />
            </label>
          </div>

          {/* Academic History Card */}
          <div className="neo-raised p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-[#D4D4D4] flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#007ACC]" />
                Academic History
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[10px] font-bold text-[#007ACC] hover:border-[#555555] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-red-500 hover:border-[#555555] transition-all"
                    aria-label="Cancel editing academic history"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-emerald-500 hover:border-[#555555] transition-all"
                    aria-label="Save academic history details"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            
            <div className="space-y-5">
              {/* SSC Details */}
              {(formData.sscGroup || formData.sscYear || formData.sscResult || isEditing) && (
                <div className="p-4 rounded-sm bg-[#1E1E1E] border border-[#3E3E42]">
                  <h4 className="text-xs font-bold text-[#D4D4D4] mb-3 border-b border-[#111317]/20 pb-2">SSC / O-Levels</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Group</p>
                      {isEditing ? <input name="sscGroup" value={formData.sscGroup} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.sscGroup || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Year</p>
                      {isEditing ? <input name="sscYear" value={formData.sscYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.sscYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Result</p>
                      {isEditing ? <input name="sscResult" value={formData.sscResult} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.sscResult || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* HSC Details */}
              {(formData.hscGroup || formData.hscYear || formData.hscResult || isEditing) && (
                <div className="p-4 rounded-sm bg-[#1E1E1E] border border-[#3E3E42]">
                  <h4 className="text-xs font-bold text-[#D4D4D4] mb-3 border-b border-[#111317]/20 pb-2">HSC / A-Levels</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Group</p>
                      {isEditing ? <input name="hscGroup" value={formData.hscGroup} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.hscGroup || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Year</p>
                      {isEditing ? <input name="hscYear" value={formData.hscYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.hscYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Result</p>
                      {isEditing ? <input name="hscResult" value={formData.hscResult} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.hscResult || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Bachelors Details */}
              {(formData.bachelorsMajor || formData.bachelorsYear || formData.bachelorsCgpa || isEditing) && (
                <div className="p-4 rounded-sm bg-[#1E1E1E] border border-[#3E3E42]">
                  <h4 className="text-xs font-bold text-[#D4D4D4] mb-3 border-b border-[#111317]/20 pb-2">Bachelor's Degree</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Major</p>
                      {isEditing ? <input name="bachelorsMajor" value={formData.bachelorsMajor} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.bachelorsMajor || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Year</p>
                      {isEditing ? <input name="bachelorsYear" value={formData.bachelorsYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.bachelorsYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">CGPA</p>
                      {isEditing ? <input name="bachelorsCgpa" value={formData.bachelorsCgpa} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.bachelorsCgpa || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Masters Details */}
              {(formData.mastersMajor || formData.mastersYear || formData.mastersCgpa || isEditing) && (
                <div className="p-4 rounded-sm bg-[#1E1E1E] border border-[#3E3E42]">
                  <h4 className="text-xs font-bold text-[#D4D4D4] mb-3 border-b border-[#111317]/20 pb-2">Master's Degree</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Major</p>
                      {isEditing ? <input name="mastersMajor" value={formData.mastersMajor} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.mastersMajor || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">Year</p>
                      {isEditing ? <input name="mastersYear" value={formData.mastersYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.mastersYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#858585] mb-1">CGPA</p>
                      {isEditing ? <input name="mastersCgpa" value={formData.mastersCgpa} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold">{formData.mastersCgpa || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences Card */}
          <div className="neo-raised p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-[#D4D4D4] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#4EC9B0]" />
                Preferences
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[10px] font-bold text-[#007ACC] hover:border-[#555555] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-red-500 hover:border-[#555555] transition-all"
                    aria-label="Cancel editing preferences"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-emerald-500 hover:border-[#555555] transition-all"
                    aria-label="Save preference changes"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">

              <div>
                <p className="text-[10px] font-bold text-[#858585] mb-1">Preferred Level</p>
                {isEditing ? <input name="preferredStudyLevel" value={formData.preferredStudyLevel} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold bg-[#252526]/30 p-2.5 rounded-sm">{formData.preferredStudyLevel || 'Not specified'}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#858585] mb-1">Preferred Country</p>
                {isEditing ? <input name="preferredCountry" value={formData.preferredCountry} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold bg-[#252526]/30 p-2.5 rounded-sm">{formData.preferredCountry || 'Not specified'}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#858585] mb-1">Preferred Course</p>
                {isEditing ? <input name="preferredCourse" value={formData.preferredCourse} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-[#D4D4D4] font-bold bg-[#252526]/30 p-2.5 rounded-sm">{formData.preferredCourse || 'Not specified'}</p>}
              </div>
            </div>
          </div>



          {/* English Proficiency Card */}
          <div className="neo-raised p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-[#D4D4D4] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#21C285]" />
                English Proficiency
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[10px] font-bold text-[#007ACC] hover:border-[#555555] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-red-500 hover:border-[#555555] transition-all"
                    aria-label="Cancel editing English proficiency"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-emerald-500 hover:border-[#555555] transition-all"
                    aria-label="Save English proficiency changes"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <select name="englishTestStatus" value={formData.englishTestStatus} onChange={handleEditChange} className={selectClass}>
                  <option value="">Select Status</option>
                  <option value="Appeared">Appeared</option>
                  <option value="Planning">Planning</option>
                  <option value="Not Required">Not Required</option>
                </select>
                {formData.englishTestStatus === 'Appeared' && (
                  <div className="flex gap-3">
                    <input name="englishTestType" placeholder="Test Type (IELTS, PTE)" value={formData.englishTestType} onChange={handleEditChange} className={inputClass} />
                    <input name="englishTestScore" placeholder="Score" value={formData.englishTestScore} onChange={handleEditChange} className={inputClass} />
                  </div>
                )}
              </div>
            ) : (
              formData.englishTestStatus === 'Appeared' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-center">
                    <p className="text-[10px] font-bold text-[#858585] uppercase tracking-wider mb-1">Test Type</p>
                    <p className="text-base font-black text-[#D4D4D4] font-display">{formData.englishTestType || '-'}</p>
                  </div>
                  <div className="p-3.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-center">
                    <p className="text-[10px] font-bold text-[#858585] uppercase tracking-wider mb-1">Overall Score</p>
                    <p className="text-base font-black text-[#D4D4D4] font-display">{formData.englishTestScore || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[#858585] uppercase tracking-wider mb-1">Test Status</p>
                    <p className="text-xs font-bold text-[#D4D4D4]">{formData.englishTestStatus || 'Not specified'}</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Budget & Origin Card */}
          <div className="neo-raised p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-[#D4D4D4] flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#CE9178]" />
                Origin & Budget
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[10px] font-bold text-[#007ACC] hover:border-[#555555] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-red-500 hover:border-[#555555] transition-all"
                    aria-label="Cancel editing origin and budget details"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-emerald-500 hover:border-[#555555] transition-all"
                    aria-label="Save origin and budget changes"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-sm bg-[#1E1E1E] border border-[#3E3E42]">
                <p className="text-[10px] font-bold text-[#858585] uppercase tracking-wider mb-1">Source</p>
                {isEditing ? (
                  <select name="source" value={formData.source} onChange={handleEditChange} className={selectClass}>
                    <option value="">Unknown</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Word of Mouth">Word of Mouth</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Agent">Agent</option>
                    <option value="Event/Seminar">Event/Seminar</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-xs font-bold text-[#D4D4D4]">{formData.source || 'Unknown'}</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Column - Timeline, Followups & Apps */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Consultation Notes Timeline */}
          <div className="neo-raised flex flex-col h-[400px]">
            <div className="p-5 border-b border-[#111317]/20 flex justify-between items-center bg-[#252526]/20">
              <h3 className="text-sm font-bold text-[#D4D4D4] flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#007ACC]" />
                Activity Timeline
              </h3>
            </div>
            
            <div ref={timelineContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
              {lead.initialNote && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-blue-500">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1E1E1E] border border-[#3E3E42] p-4 rounded-md text-xs text-[#CCCCCC]">
                      <div className="flex justify-between items-start mb-2 border-b border-[#111317]/10 pb-1.5">
                        <p className="font-bold text-[#007ACC]">Initial Inquiry Note</p>
                        <p className="text-[10px] text-[#858585]">{new Date(lead.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed font-semibold">{lead.initialNote}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {localInteractions.map((interaction: any) => (
                <div key={interaction.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-indigo-500">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1E1E1E] border border-[#3E3E42] p-4 rounded-md text-xs text-[#CCCCCC]">
                      <div className="flex justify-between items-start mb-2 border-b border-[#111317]/10 pb-1.5">
                        <p className="font-bold text-[#D4D4D4]">
                          {interaction.counselor ? `${interaction.counselor.fullName} ${interaction.counselor.role ? `(${interaction.counselor.role})` : ''}` : 'System'}
                        </p>
                        <p className="text-[10px] text-[#858585]">{new Date(interaction.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed font-semibold">{interaction.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {localInteractions.length === 0 && !lead.initialNote && (
                <div className="text-center text-[#858585] py-12 font-bold text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
            
            {canEdit && (
              <div className="p-4 border-t border-[#111317]/20 bg-[#252526]/25">
                <div className="flex gap-3">
                  <textarea 
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add a consultation note..." 
                    className="flex-1 bg-[#1E1E1E] border border-[#3E3E42] border-none rounded-sm p-3 text-xs font-semibold text-[#D4D4D4] placeholder-[#858585] focus:outline-none resize-none h-12 transition-all duration-200 focus:h-24"
                  ></textarea>
                  <button 
                    onClick={handlePostNote}
                    disabled={isPostingNote}
                    className="px-5 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150 h-12 self-end"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Follow-Up Tasks Card */}
          {canEdit && (
            <div className="neo-raised p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-[#D4D4D4] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#CE9178]" />
                  Follow-Up Tasks
                </h3>
                <button 
                  onClick={() => setIsAddingTask(!isAddingTask)} 
                  className="px-3.5 py-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[10px] font-bold text-[#007ACC] hover:border-[#555555] transition-all"
                >
                  {isAddingTask ? 'Cancel' : '+ Add Task'}
                </button>
              </div>
              
              {isAddingTask && (
                <div className="mb-5 bg-[#1E1E1E] border border-[#3E3E42] p-4 rounded-sm space-y-4">
                  <input 
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    placeholder="Task description..."
                    className={inputClass}
                  />
                  <div className="flex items-center gap-4">
                    <input 
                      type="datetime-local" 
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                    <button 
                      onClick={handleAddTask} 
                      className="px-5 py-2.5 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold border border-[#3E3E42] active:translate-y-0.5 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {lead.tasks?.length === 0 ? (
                  <div className="text-center text-[#858585] py-8 border border-dashed border-[#111317] rounded-sm font-bold text-xs">
                    No upcoming tasks.
                  </div>
                ) : (
                  lead.tasks?.map((task: any) => (
                    <div key={task.id} className={`flex items-start gap-3 bg-[#1E1E1E] p-4 rounded-md border border-[#3E3E42] transition-all ${task.status === 'Completed' ? 'opacity-50' : 'group hover:border-[#555555]'}`}>
                      <input 
                        type="checkbox" 
                        disabled={!canEdit}
                        checked={task.status === 'Completed'}
                        onChange={() => handleTaskStatus(task.id, task.status)}
                        className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#007ACC] disabled:opacity-50 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-normal ${task.status === 'Completed' ? 'line-through text-[#858585]' : 'text-[#D4D4D4]'}`}>{task.description}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1.5">
                          <p className="text-[10px] text-[#CE9178] font-bold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {new Date(task.dueDate).toLocaleString()} {task.status === 'Completed' && ' (Completed)'}
                          </p>
                          {task.counselor && (
                            <span className="text-[10px] text-[#858585] font-semibold">
                              • Added by {task.counselor.fullName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enrollments list */}
      <div className="neo-raised p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#D4D4D4] flex items-center gap-2">
            <Building className="h-5 w-5 text-[#4EC9B0]" /> Course Enrollments
          </h3>
          {canEdit && (
            <button 
              onClick={() => setIsAddingApp(!isAddingApp)} 
              className="px-3.5 py-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[10px] font-bold text-[#007ACC] hover:border-[#555555] transition-all"
            >
              {isAddingApp ? 'Cancel' : '+ Add Enrollment'}
            </button>
          )}
        </div>

        {isAddingApp && (
          <div className="mb-5 bg-[#1E1E1E] border border-[#3E3E42] p-5 rounded-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              value={selectedCourse}
              onChange={e => {
                setSelectedCourse(e.target.value)
                setSelectedBatch('')
              }}
              className={selectClass}
            >
              <option value="">Select Course</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className={selectClass}
              disabled={!selectedCourse}
            >
              <option value="">Select Batch</option>
              {selectedCourse && courses.find((c: any) => c.id === selectedCourse)?.batches?.map((batch: any) => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
            
            <button 
              onClick={handleAddApp} 
              disabled={!selectedBatch}
              className="px-5 py-2 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold border border-[#3E3E42] hover:border border-[#3E3E42] active:translate-y-0.5 transition-all disabled:opacity-50"
            >
              Enroll Student
            </button>
          </div>
        )}

        <div className="space-y-4">
          {(!lead.enrollments || lead.enrollments.length === 0) ? (
            <div className="text-center text-[#858585] py-8 border border-dashed border-[#111317] rounded-sm font-bold text-xs">
              No course enrollments yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lead.enrollments.map((enr: any) => (
                <div key={enr.id} className="p-5 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex flex-col justify-between min-h-36">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#1E1E1E] border border-[#3E3E42] text-[#4EC9B0] rounded-full">
                      {enr.batch?.course?.name}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      {enr.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#D4D4D4] mb-1 font-display">{enr.batch?.name}</h4>
                    {enr.batch?.startDate && (
                      <p className="text-[11px] text-[#CCCCCC] font-semibold">Starts: {new Date(enr.batch.startDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
