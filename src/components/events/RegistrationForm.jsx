import { useState } from 'react'

const isPrivateSports = (event) =>
  event?.visibility === 'private' && (event?.category === 'Sports' || event?.category === 'sports')

function getProgramsRequiringRegistration(programs) {
  if (!Array.isArray(programs)) return []
  return programs
    .map((p, index) => ({ ...p, index }))
    .filter((p) => p.requiresRegistration)
}

export function RegistrationForm({ event, onRegister, isSubmitting, mode = 'event', selectedProgramIndex = null }) {
  const [phone, setPhone] = useState('')
  const [userClass, setUserClass] = useState('')
  const [section, setSection] = useState('')
  const [branch, setBranch] = useState('')
  const [selectedProgramIndices, setSelectedProgramIndices] = useState([])

  const programsToRegister = getProgramsRequiringRegistration(event?.programs)
  const showSportsFields = isPrivateSports(event)
  const isProgramMode = mode === 'program'

  const program = isProgramMode && selectedProgramIndex != null ? event?.programs?.[selectedProgramIndex] : null

  const toggleProgram = (index) => {
    setSelectedProgramIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const phoneTrimmed = phone.trim()
    if (!phoneTrimmed) return
    if (showSportsFields) {
      if (!userClass.trim() || !section.trim() || !branch.trim()) return
    }
    onRegister({
      phone: phoneTrimmed,
      class: userClass.trim(),
      section: section.trim(),
      branch: branch.trim(),
      programIds: isProgramMode ? [selectedProgramIndex] : selectedProgramIndices,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="font-display text-lg font-bold text-gray-900">
          {isProgramMode && program
            ? program.title || `Session ${selectedProgramIndex + 1}`
            : 'Your details'}
        </h3>
        <p className="mt-0.5 text-sm text-gray-600">
          {isProgramMode && program
            ? 'Enter your details to participate in this session.'
            : 'We’ll use this to confirm your registration and for check-in.'}
        </p>
      </div>

      <div>
        <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700">
          Phone number <span className="text-red-500">*</span>
        </label>
        <input
          id="reg-phone"
          type="tel"
          className="input mt-1 w-full"
          placeholder="e.g. 9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      {showSportsFields && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="reg-class" className="block text-sm font-medium text-gray-700">
              Class <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-class"
              type="text"
              className="input mt-1"
              placeholder="e.g. 10"
              value={userClass}
              onChange={(e) => setUserClass(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="reg-section" className="block text-sm font-medium text-gray-700">
              Section <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-section"
              type="text"
              className="input mt-1"
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="reg-branch" className="block text-sm font-medium text-gray-700">
              Branch <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-branch"
              type="text"
              className="input mt-1"
              placeholder="e.g. Science"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      {isProgramMode && program?.dateTime && (
        <div className="text-sm text-gray-600">
          <p className="font-medium">Program time:</p>
          <p>{new Date(program.dateTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
      )}

      {!isProgramMode && programsToRegister.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Optional: also register for these sessions
          </p>
          <ul className="space-y-2">
            {programsToRegister.map(({ index, title, dateTime }) => (
              <li key={index} className="flex flex-wrap items-center gap-2 sm:gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedProgramIndices.includes(index)}
                    onChange={() => toggleProgram(index)}
                  />
                  <span className="text-sm font-medium text-gray-900">{title || `Session ${index + 1}`}</span>
                </label>
                {dateTime && (
                  <span className="text-xs text-gray-500">
                    {new Date(dateTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? 'Registering…'
          : isProgramMode
            ? 'Confirm participation'
            : 'Register for this event'}
      </button>
    </form>
  )
}
