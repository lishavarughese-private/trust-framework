// AC: TASK-007 — Date picker component with client-side validation
// - Past start dates are disabled
// - End date cannot be before start date
// - Inline error shown within 300ms of invalid input
// - No console errors during interaction

import { useState, useCallback } from 'react';

function toDateInputValue(date) {
  return date.toISOString().split('T')[0];
}

function todayString() {
  return toDateInputValue(new Date());
}

/**
 * @param {{
 *   startDate: string,
 *   endDate: string,
 *   onStartChange: (val: string) => void,
 *   onEndChange: (val: string) => void,
 *   error: string | null,
 * }} props
 */
export default function DatePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  error,
}) {
  const [localError, setLocalError] = useState(null);

  const validateRange = useCallback((start, end) => {
    if (!start || !end) { setLocalError(null); return; }
    const s = new Date(start);
    const e = new Date(end);
    if (e <= s) {
      setLocalError('End date must be after the start date.');
    } else {
      setLocalError(null);
    }
  }, []);

  function handleStartChange(e) {
    const val = e.target.value;
    onStartChange(val);
    validateRange(val, endDate);
  }

  function handleEndChange(e) {
    const val = e.target.value;
    onEndChange(val);
    validateRange(startDate, val);
  }

  const displayError = error || localError;

  return (
    <fieldset className="date-picker">
      <legend className="date-picker__legend">Rental Period</legend>

      <div className="date-picker__fields">
        <div className="date-picker__field">
          <label htmlFor="start_date" className="date-picker__label">
            Start Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="start_date"
            type="date"
            name="start_date"
            value={startDate}
            min={todayString()}
            onChange={handleStartChange}
            required
            aria-describedby={displayError ? 'date-error' : undefined}
            className="date-picker__input"
          />
        </div>

        <div className="date-picker__field">
          <label htmlFor="end_date" className="date-picker__label">
            End Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="end_date"
            type="date"
            name="end_date"
            value={endDate}
            min={startDate || todayString()}
            onChange={handleEndChange}
            required
            aria-describedby={displayError ? 'date-error' : undefined}
            className="date-picker__input"
          />
        </div>
      </div>

      {displayError && (
        <p
          id="date-error"
          role="alert"
          aria-live="assertive"
          className="date-picker__error"
        >
          {displayError}
        </p>
      )}

      <style jsx>{`
        .date-picker {
          border: none;
          padding: 0;
          margin: 0;
        }
        .date-picker__legend {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }
        .date-picker__fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .date-picker__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .date-picker__label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .date-picker__input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          color: #111;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .date-picker__input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .date-picker__error {
          color: #b91c1c;
          font-size: 0.85rem;
          margin: 0.5rem 0 0;
          padding: 0.4rem 0.75rem;
          background: #fee2e2;
          border-radius: 4px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .date-picker__fields { grid-template-columns: 1fr; }
        }
      `}</style>
    </fieldset>
  );
}
