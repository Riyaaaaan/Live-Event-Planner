import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { resetPassword } from '../../services/authService'

const schema = z.object({
  email: z.string().email('Invalid email'),
})

export function PasswordReset() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    try {
      await resetPassword(data.email)
      setSent(true)
      toast.success('Check your email for the reset link.')
    } catch (e) {
      toast.error(e.message || 'Failed to send reset email')
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-display text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="mt-2 text-gray-600">
          We&apos;ve sent a password reset link. If you don&apos;t see it, check your spam folder.
        </p>
        <Link to="/login" className="btn-primary mt-6 inline-block">
          Back to Log in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-gray-900">Reset password</h1>
      <p className="mt-1 text-gray-600">Enter your email and we&apos;ll send you a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input mt-1"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Back to Log in
        </Link>
      </p>
    </div>
  )
}
