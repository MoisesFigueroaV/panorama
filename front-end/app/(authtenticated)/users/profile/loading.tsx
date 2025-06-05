import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="container py-10 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-9 w-[150px]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-[180px]" />
              <Skeleton className="h-4 w-[280px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              ))}
              <Skeleton className="h-9 w-[150px]" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
