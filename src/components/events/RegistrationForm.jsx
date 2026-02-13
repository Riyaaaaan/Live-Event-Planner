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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <h3 className="font-display text-lg font-bold text-gray-900">
        {isProgramMode && program
          ? `Register for: ${program.title || `Program ${selectedProgramIndex + 1}`}`
          : 'Registration details'}
      </h3>

      <div>
        <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700">
          Phone number <span className="text-red-500">*</span>
        </label>
        <input
          id="reg-phone"
          type="tel"
          className="input mt-1"
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
          <div>
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
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Programs requiring registration (select the ones you are registering for)
          </p>
          <ul className="space-y-2">
            {programsToRegister.map(({ index, title, dateTime }) => (
              <li key={index} className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedProgramIndices.includes(index)}
                    onChange={() => toggleProgram(index)}
                  />
                  <span className="text-sm font-medium text-gray-900">{title || `Program ${index + 1}`}</span>
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

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting
          ? 'Registering…'
          : isProgramMode
            ? 'Register for this program'
            : 'Register for this event'}
      </button>
    </form>
  )
}
