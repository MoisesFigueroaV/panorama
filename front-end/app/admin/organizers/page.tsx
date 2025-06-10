import { AdminOrganizerTable } from "@/components/admin/admin-organizer-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function OrganizersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Organizadores</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizadores</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminOrganizerTable />
        </CardContent>
      </Card>
    </div>
  )
}
