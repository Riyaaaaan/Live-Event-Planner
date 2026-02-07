import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EVENT_CATEGORIES } from '../../utils/constants'

export const PROGRAM_DEFAULT = { dateTime: '', title: '', description: '' }

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  status: z.enum(['draft', 'published']).default('draft'),
  'location.type': z.enum(['physical', 'virtual']).default('physical'),
  'location.address': z.string().optional(),
  'location.virtualLink': z.string().url().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true
    return new Date(data.endDate) >= new Date(data.startDate)
  },
  { message: 'End date must be after start date', path: ['endDate'] }
)

const defaultValues = {
  title: '',
  description: '',
  category: '',
  startDate: '',
  endDate: '',
  capacity: 100,
  visibility: 'public',
  status: 'draft',
  'location.type': 'physical',
  'location.address': '',
  'location.virtualLink': '',
}

function parseProgramsFromEvent(event) {
  if (!event?.programs?.length) return []
  return event.programs.map((p) => ({
    dateTime: p.dateTime
      ? typeof p.dateTime === 'string'
        ? p.dateTime.slice(0, 16)
        : new Date(p.dateTime).toISOString().slice(0, 16)
      : '',
    title: p.title ?? '',
    description: p.description ?? '',
  }))
}

export function EventForm({ event, onSubmit, isSubmitting }) {
  const [programs, setPrograms] = useState(() => parseProgramsFromEvent(event))

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          ...defaultValues,
          ...event,
          startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
          'location.type': event.location?.type ?? 'physical',
          'location.address': event.location?.address ?? '',
          'location.virtualLink': event.location?.virtualLink ?? '',
        }
      : defaultValues,
  })

  const locationType = watch('location.type')

  function addProgram() {
    setPrograms((prev) => [...prev, { ...PROGRAM_DEFAULT }])
  }

  function removeProgram(index) {
    setPrograms((prev) => prev.filter((_, i) => i !== index))
  }

  function updateProgram(index, field, value) {
    setPrograms((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  function handleFormSubmit(data) {
    const sorted = [...programs]
      .filter((p) => p.dateTime && p.title.trim())
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
    onSubmit({ ...data, programs: sorted })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input className="input mt-1" {...register('title')} />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="input mt-1 min-h-[100px]"
          {...register('description')}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select className="input mt-1" {...register('category')}>
            <option value="">Select category</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Capacity</label>
          <input type="number" className="input mt-1" {...register('capacity')} />
          {errors.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start date & time</label>
          <input type="datetime-local" className="input mt-1" {...register('startDate')} />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End date & time</label>
          <input type="datetime-local" className="input mt-1" {...register('endDate')} />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location type</label>
        <select className="input mt-1" {...register('location.type')}>
          <option value="physical">Physical</option>
          <option value="virtual">Virtual</option>
        </select>
      </div>
      {locationType === 'physical' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input className="input mt-1" {...register('location.address')} placeholder="123 Main St, City" />
        </div>
      )}
      {locationType === 'virtual' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Virtual link</label>
          <input className="input mt-1" {...register('location.virtualLink')} placeholder="https://..." />
          {errors['location.virtualLink'] && (
            <p className="mt-1 text-sm text-red-600">{errors['location.virtualLink'].message}</p>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Visibility</label>
          <select className="input mt-1" {...register('visibility')}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select className="input mt-1" {...register('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Program (by day & time)</label>
          <button
            type="button"
            onClick={addProgram}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            + Add program
          </button>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Add sessions or activities with date, time, and optional description.
        </p>
        {programs.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                    Day & time
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                    Title
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                    Description (optional)
                  </th>
                  <th scope="col" className="relative w-10 px-2 py-2">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {programs.map((p, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-3 py-2">
                      <input
                        type="datetime-local"
                        className="input w-full text-sm"
                        value={p.dateTime}
                        onChange={(e) => updateProgram(index, 'dateTime', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="input w-full text-sm"
                        placeholder="e.g. Opening keynote"
                        value={p.title}
                        onChange={(e) => updateProgram(index, 'title', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="input w-full text-sm"
                        placeholder="Optional"
                        value={p.description}
                        onChange={(e) => updateProgram(index, 'description', e.target.value)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeProgram(index)}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Remove program"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : event ? 'Update event' : 'Create event'}
        </button>
      </div>
    </form>
  )
}
