import { Badge } from '@/components/ui/Badge'
import { daysUntil } from '@/lib/uspto'
interface Props { deadline: string | null }
export function DeadlineBadge({ deadline }: Props) {
  const days = daysUntil(deadline)
  if (days === null) return null
  if (days < 0)  return <Badge variant="danger">OVERDUE</Badge>
  if (days < 30) return <Badge variant="danger">{days}d left</Badge>
  if (days < 90) return <Badge variant="warning">{days}d left</Badge>
  return <Badge variant="success">{days}d left</Badge>
}
