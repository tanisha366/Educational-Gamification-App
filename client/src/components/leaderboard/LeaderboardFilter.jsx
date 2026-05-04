import { useEffect, useRef, useState } from 'react'
import './leaderboard.css'

const SUBJECT_OPTIONS = ['All', 'Math', 'Science', 'Physics', 'History']
const TIME_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'all-time', label: 'All-Time' },
]

function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handlePointer(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const selected = options.find((option) => option.value === value)

  return (
    <div className={`filter-select ${open ? 'is-open' : ''}`} ref={rootRef}>
      <span className="filter-select__label">{label}</span>
      <button
        type="button"
        className="filter-select__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label ?? value}</span>
        <span className="filter-select__chevron" aria-hidden="true">⌄</span>
      </button>

      {open ? (
        <div className="filter-select__menu" role="listbox" aria-label={label}>
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                className={`filter-select__option ${isSelected ? 'is-selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span>{option.label}</span>
                {isSelected ? (
                  <span className="filter-select__check" aria-hidden="true">•</span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function LeaderboardFilter({ subject, timeRange, onSubjectChange, onTimeRangeChange }) {
  return (
    <section className="filter-row" aria-label="Leaderboard filters">
      <FilterSelect
        label="Subject"
        value={subject}
        options={SUBJECT_OPTIONS.map((option) => ({ value: option, label: option }))}
        onChange={onSubjectChange}
      />

      <FilterSelect
        label="Time"
        value={timeRange}
        options={TIME_OPTIONS}
        onChange={onTimeRangeChange}
      />
    </section>
  )
}

export default LeaderboardFilter
