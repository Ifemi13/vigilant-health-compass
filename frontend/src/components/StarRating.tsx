/** CMS overall hospital star rating, e.g. ★★★★☆; "Not rated" when CMS has none. */
export default function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-xs text-slate-500 dark:text-slate-400">Not rated</span>
  return (
    <span className="text-sm whitespace-nowrap" title={`CMS overall rating: ${rating} of 5 stars`}>
      <span className="text-amber-500" aria-hidden>
        {'★'.repeat(rating)}
      </span>
      <span className="text-slate-300 dark:text-slate-600" aria-hidden>
        {'★'.repeat(5 - rating)}
      </span>
      <span className="sr-only">CMS rating {rating} of 5 stars</span>
    </span>
  )
}
