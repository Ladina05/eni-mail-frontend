export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'STAFF'
export type StudyLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2'
export type AcademicMention = 'COMPUTER_SCIENCE' | 'ARTIFICIAL_INTELLIGENCE' | 'DIGITAL_EXPERTISE'
export type AcademicPath = 'SOFTWARE_ENGINEERING_DATABASES' | 'SYSTEMS_NETWORKS_ADMINISTRATION' | 'GENERAL_COMPUTING' | 'DATA_GOVERNANCE_ENGINEERING' | 'CONNECTED_OBJECTS_CYBERSECURITY' | 'DIGITAL_JOBS' | 'INFORMATION_SYSTEMS_AUDIT'
export type TeacherPosition = 'FULL_PROFESSOR' | 'PROFESSOR' | 'ASSOCIATE_PROFESSOR' | 'HIGHER_EDUCATION_RESEARCH_ASSISTANT' | 'ADJUNCT_LECTURER'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  active: boolean
  department: string | null
  promotion: string | null
  studyLevel: StudyLevel | null
  academicMention: AcademicMention | null
  academicPath: AcademicPath | null
  teacherPosition: TeacherPosition | null
  institutionalResponsibility: string | null
  staffPosition: string | null
  studentNumber: string | null
}

export interface AuthResponse { token: string; user: User }
export interface Attachment { id: string; originalName: string; contentType: string; size: number; uploadedAt: string }
export interface MailMessage { id: string; subject: string; body: string; senderEmail: string; senderName: string; sentAt: string | null; read: boolean; starred: boolean; archived: boolean; draft: boolean; attachments: Attachment[] }
export interface MailGroup { id: string; name: string; description: string | null; createdByEmail: string; createdAt: string }
export interface Department { id: string; name: string; description?: string | null }
export interface Promotion { id: string; name: string; description?: string | null }
export interface NotificationItem { id: string; title: string; content: string; read: boolean; createdAt: string; messageId: string | null }
export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash'
