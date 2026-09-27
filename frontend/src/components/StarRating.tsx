import { StarFilled } from '@mingcute/react/core-filled'

/** CMS overall hospital star rating as five stars; "Not rated" when CMS has none. */
export default function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-xs text-slate-500 dark:text-slate-400">Not rated</span>
  return (
    <span className="inline-flex items-center gap-0.5" title={`CMS overall rating: ${rating} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarFilled key={star} size={14} className={star <= rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'} />
      ))}
      <span className="sr-only">CMS rating {rating} of 5 stars</span>
    </span>
  )
}
