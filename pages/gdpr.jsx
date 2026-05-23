// AC: TASK-013 — GDPR data deletion request UI
// - Email input + submit button
// - Calls DELETE /api/users/data
// - Shows confirmation on success
// - Field-level error for invalid/missing email
// - No console errors during submission flow

import { useState } from 'react';
import Head from 'next/head';

export default function GdprPage() {
  const [email,       setEmail]       = useState('');
  const [emailError,  setEmailError]  = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [confirmed,   setConfirmed]   = useState(false);
  const [globalError, setGlobalError] = useState(null);

  function validateEmail(val) {
    if (!val)  return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'A valid email address is required.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError(null);

    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError(null);

    setSubmitting(true);
    try {
      const res = await fetch('/api/users/data', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setConfirmed(true);
    } catch {
      setGlobalError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <>
        <Head><title>Deletion Requested — Car Reservation</title></Head>
        <main className="page">
          <div className="confirmation" role="status" aria-live="polite">
            <span className="confirmation__icon" aria-hidden="true">🗑️</span>
            <h1>Deletion Request Received</h1>
            <p>
              Your request to delete all personal data associated with{' '}
              <strong>{email}</strong> has been received.
            </p>
            <p className="confirmation__note">
              Your data will be permanently deleted within 24 hours in accordance
              with our GDPR obligations.
            </p>
            <a href="/" className="confirmation__link">Return to homepage</a>
          </div>

          <style jsx>{`
            .page { max-width: 600px; margin: 4rem auto; padding: 1rem; font-family: system-ui, sans-serif; text-align: center; }
            .confirmation { background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 2.5rem; }
            .confirmation__icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
            h1 { font-size: 1.75rem; font-weight: 800; color: #92400e; margin: 0 0 0.75rem; }
            p  { color: #374151; margin: 0.4rem 0; }
            .confirmation__note { font-size: 0.85rem; color: #6b7280; margin-top: 1rem; }
            .confirmation__link { display: inline-block; margin-top: 1.5rem; color: #2563eb; font-weight: 600; }
          `}</style>
        </main>
      </>
    );
  }

  return (
    <>
      <Head><title>Delete My Data — Car Reservation</title></Head>
      <main className="page">
        <a href="/" className="back-link">← Back to homepage</a>
        <h1>Delete My Personal Data</h1>
        <p className="description">
          Under GDPR, you have the right to request permanent deletion of all
          personal data we hold about you. Enter your email below to submit a
          deletion request.
        </p>

        {globalError && (
          <div className="global-error" role="alert">{globalError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="form">
          <div className="form__field">
            <label htmlFor="email" className="form__label">
              Email Address <span aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(validateEmail(e.target.value));
              }}
              required
              autoComplete="email"
              className={`form__input ${emailError ? 'form__input--error' : ''}`}
              aria-describedby={emailError ? 'email-error' : undefined}
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p id="email-error" role="alert" aria-live="polite" className="field-error">
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!email || !!emailError || submitting}
            className="form__submit"
            aria-busy={submitting}
          >
            {submitting ? 'Submitting...' : 'Request Data Deletion'}
          </button>
        </form>

        <p className="disclaimer">
          This action is permanent and cannot be undone. All bookings and personal
          data associated with this email will be permanently removed.
        </p>
      </main>

      <style jsx>{`
        .page { max-width: 580px; margin: 0 auto; padding: 2rem 1rem; font-family: system-ui, sans-serif; }
        .back-link { color: #2563eb; font-size: 0.875rem; text-decoration: none; display: inline-block; margin-bottom: 1.5rem; }
        h1 { font-size: 1.75rem; font-weight: 800; color: #111; margin: 0 0 0.75rem; }
        .description { color: #6b7280; margin: 0 0 1.75rem; line-height: 1.6; }
        .global-error { background: #fee2e2; color: #b91c1c; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.9rem; }
        .form { display: flex; flex-direction: column; gap: 1.25rem; }
        .form__field { display: flex; flex-direction: column; gap: 0.35rem; }
        .form__label { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .form__input { padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; color: #111; transition: border-color 0.15s; }
        .form__input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .form__input--error { border-color: #b91c1c; }
        .field-error { color: #b91c1c; font-size: 0.82rem; margin: 0.3rem 0 0; padding: 0.3rem 0.6rem; background: #fee2e2; border-radius: 4px; }
        .form__submit { padding: 0.75rem 1.5rem; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s, opacity 0.2s; }
        .form__submit:hover:not(:disabled) { background: #b91c1c; }
        .form__submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .disclaimer { font-size: 0.8rem; color: #9ca3af; margin-top: 1.25rem; line-height: 1.5; }
      `}</style>
    </>
  );
}
