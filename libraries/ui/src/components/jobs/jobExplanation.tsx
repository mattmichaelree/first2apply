import type { JobExplanation } from "@careeros/core"

import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

export function JobExplanationCard({
  explanation,
  className,
  title = "Why this job is showing up",
}: {
  explanation: JobExplanation | null | undefined
  className?: string
  title?: string
}) {
  if (!explanation) {
    return null
  }

  const hasEvidence = explanation.evidence.length > 0
  const hasFitReasons = explanation.fit_reasons.length > 0
  const hasConcerns = explanation.concerns.length > 0
  const hasFilterReasons = explanation.filter_reasons.length > 0

  return (
    <Card className={cn("border-muted/80", className)}>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {explanation.mode}
          </Badge>
        </div>
        {explanation.summary && (
          <CardDescription>{explanation.summary}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {hasFitReasons && (
          <ExplanationSection
            title="Match signals"
            items={explanation.fit_reasons}
          />
        )}

        {hasFilterReasons && (
          <ExplanationSection
            title="Filter reasons"
            items={explanation.filter_reasons}
          />
        )}

        {hasConcerns && (
          <ExplanationSection
            title="Concerns"
            items={explanation.concerns}
          />
        )}

        {hasEvidence && (
          <div>
            <p className="font-medium">Evidence</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {explanation.evidence.map((item, index) => (
                <Badge
                  key={`${item.label}-${item.value}-${index}`}
                  variant="secondary"
                  className="max-w-full break-all"
                >
                  <span className="font-medium">{item.label}:</span>
                  <span className="ml-1">{item.value}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ExplanationSection({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div>
      <p className="font-medium">{title}</p>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="list-inside list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
