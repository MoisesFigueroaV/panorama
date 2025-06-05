import type React from "react"
import { OrganizerSidebar } from "@/components/organizer/organizer-sidebar"
import { OrganizerHeader } from "@/components/organizer/organizer-header"

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <OrganizerSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <OrganizerHeader />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
