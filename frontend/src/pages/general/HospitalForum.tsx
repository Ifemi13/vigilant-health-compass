import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { Button, ErrorBanner, FullPageSpinner } from '../../components/ui'
import { AWARENESS_TOPICS } from '../../content/awarenessTopics'
import { ApiError, errorMessage } from '../../lib/api'
import {
  MAX_COMMENT_LENGTH,
  ROLE_LABELS,
  timeAgo,
  useCommunityMe,
  useHospital,
  useHospitalComments,
  usePostComment,
  type HospitalComment,
} from '../../lib/community'

/** A specialty hospital's community: anyone signed in can read and post suggestions. */
export default function HospitalForum() {
  const { topicId = '', hospitalId = '' } = useParams()
  const topic = AWARENESS_TOPICS.find((t) => t.id === topicId)
  const hospital = useHospital(hospitalId)

  const backLink = (
    <Link to={`/general/awareness/${topicId}`} className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
      ← Back to {topic?.title ?? 'topic'}
    </Link>
  )

  if (hospital.isPending) return <FullPageSpinner />
  if (hospital.isError) {
    const notFound = hospital.error instanceof ApiError && hospital.error.status === 404
    return (
      <>
        {backLink}
        <div className="mt-6">
          <ErrorBanner message={notFound ? 'Hospital not found.' : errorMessage(hospital.error)} />
        </div>
      </>
    )
  }

  const h = hospital.data
  return (
    <>
      {backLink}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#172220]">
        <h1 className="text-2xl font-semibold">{h.name}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {h.specialty} · {h.address}, {h.city}, {h.state} {h.postalCode}
        </p>
        {h.description && <p className="mt-3 text-slate-700 dark:text-slate-300">{h.description}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {h.phone && (
            <a href={`tel:${h.phone}`} className="text-accent hover:underline dark:text-teal-300">
              {h.phone}
            </a>
          )}
          {h.website && (
            <a href={h.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline dark:text-teal-300">
              Website ↗
            </a>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Community</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Share suggestions and experiences on tackling {topic ? topic.title.toLowerCase() : 'this condition'}. Posts
          are visible to everyone signed in. They're not medical advice. In an emergency, call 911.
        </p>
        <CommentForm hospitalId={h.id} />
        <CommentList hospitalId={h.id} />
      </section>
    </>
  )
}

function CommentForm({ hospitalId }: { hospitalId: string }) {
  const me = useCommunityMe()
  const post = usePostComment(hospitalId)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const text = body.trim()
    if (!text) {
      setError('Write something before posting.')
      return
    }
    setError(null)
    try {
      await post.mutateAsync(text)
      setBody('')
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#172220]">
      <label htmlFor="comment" className="sr-only">
        Your suggestion
      </label>
      <textarea
        id="comment"
        rows={3}
        maxLength={MAX_COMMENT_LENGTH}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What has helped you, or what would you suggest?"
        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 dark:border-slate-700 dark:bg-[#0f1716]"
      />
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {me.data ? (
            <>
              Posting as <strong className="font-semibold">{me.data.nickname}</strong> · {ROLE_LABELS[me.data.role]}. Your
              email is never shown.
            </>
          ) : (
            'Your name is shown as an anonymous nickname.'
          )}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {body.length}/{MAX_COMMENT_LENGTH}
          </span>
          <Button type="submit" disabled={post.isPending}>
            {post.isPending ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function CommentList({ hospitalId }: { hospitalId: string }) {
  const comments = useHospitalComments(hospitalId)

  if (comments.isPending) {
    return (
      <div className="mt-6 flex justify-center" aria-label="Loading">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
      </div>
    )
  }
  if (comments.isError) {
    return (
      <div className="mt-6">
        <ErrorBanner message={errorMessage(comments.error)} />
      </div>
    )
  }
  if (comments.data.length === 0) {
    return <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">No posts yet. Be the first to share a suggestion.</p>
  }
  return (
    <ul className="mt-6 space-y-3">
      {comments.data.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </ul>
  )
}

function CommentItem({ comment }: { comment: HospitalComment }) {
  const initials = comment.authorName
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')

  return (
    <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#172220]">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong dark:bg-accent/20 dark:text-teal-200"
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-semibold">{comment.authorName}</span>
          {comment.mine && <span className="text-xs text-slate-500 dark:text-slate-400">(you)</span>}
          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {ROLE_LABELS[comment.authorRole]}
          </span>
          <time dateTime={comment.createdAt} title={new Date(comment.createdAt).toLocaleString()} className="text-xs text-slate-500 dark:text-slate-400">
            {timeAgo(comment.createdAt)}
          </time>
        </p>
        <p className="mt-1.5 text-sm whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300">{comment.body}</p>
      </div>
    </li>
  )
}
