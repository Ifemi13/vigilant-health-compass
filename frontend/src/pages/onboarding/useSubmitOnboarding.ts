import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError, errorMessage } from '../../lib/api'
import { useOnboard, type OnboardingRequest } from '../../lib/profile'

/** Posts the onboarding form and goes home; surfaces errors as a banner message. */
export function useSubmitOnboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const onboard = useOnboard()
  const [error, setError] = useState<string | null>(null)

  const submit = async (body: OnboardingRequest) => {
    setError(null)
    try {
      await onboard.mutateAsync(body)
      navigate('/pets', { replace: true })
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // Already onboarded (e.g. in another tab): just go home.
        await queryClient.invalidateQueries({ queryKey: ['me'] })
        navigate('/pets', { replace: true })
        return
      }
      setError(errorMessage(e))
    }
  }

  return { submit, error }
}
