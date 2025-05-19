import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  rating: number
  image?: string
}

export default function TestimonialCard({ quote, author, role, rating, image }: TestimonialCardProps) {
  return (
    <Card className="border-black/5 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? "fill-yellow-500 text-yellow-500" : "fill-muted text-muted-foreground"}`}
            />
          ))}
        </div>

        <p className="mb-6 text-muted-foreground">"{quote}"</p>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {image ? (
              <Image src={image || "/placeholder.svg"} alt={author} width={40} height={40} className="object-cover" />
            ) : author.charAt(0) === "C" ? (
              <div className="w-full h-full bg-[#fef2e8] flex items-center justify-center text-accent font-medium">
                {author.charAt(0)}
              </div>
            ) : author.charAt(0) === "M" ? (
              <div className="w-full h-full bg-[#e0f2f6] flex items-center justify-center text-secondary font-medium">
                {author.charAt(0)}
              </div>
            ) : (
              <div className="w-full h-full bg-[#fde8e5] flex items-center justify-center text-primary font-medium">
                {author.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
