// AC: TASK-010 — Booking form with submission and confirmation UI
// - Submit button disabled until all required fields are filled
// - Confirmation shown within 1 second of success
// - Field-level error messages for missing/invalid fields
// - No console errors during submission flow

import { useState, useEffect } from 'react';
import { useRouter }   from 'next/router';
import Head            from 'next/head';
import DatePicker      from '../components/DatePicker';

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" aria-live="polite" className="field-error">
      {message}
      <style jsx>{`
        .field-error {
          color: #b91c1c;
          font-size: 0.82rem;
          margin: 0.3rem 0 0;
          padding: 0.3rem 0.6rem;
          background: #fee2e2;
          border-radius: 4px;
        }
      `}</style>
    </p>
  );
}

export default function BookPage() {
  const router = useRouter();
  const { car_id, car_name } = router.query;

  const [form, setForm] = useState({
    startDate: '',
    endDate:   '',
    email:     '',
    name:      '',
  });

  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [confirmed,   setConfirmed]   = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // Submit button is disabled until all required fields are filled
  const isFormComplete =
    form.startDate &&
    form.endDate &&
    form.email &&
    form.name &&
    !Object.values(errors).some(Boolean);

  function validate() {
    const e = {};
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.endDate)   e.endDate   = 'End date is required.';
    if (!form.email)     e.email     = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'A valid email address is required.';
    if (!form.name) e.name = 'Name is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id,
          start_date: form.startDate,
          end_date:   form.endDate,
          email:      form.email,
          name:       form.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Surface field-level errors from the API
        if (data.detail) {
          setErrors(data.detail);
        } else {
          setGlobalError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      // Confirmation shown within 1 second of successful submission
      setConfirmed(data);
    } catch {
      setGlobalError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <>
        <Head><title>Booking Confirmed — Car Reservation</title></Head>
        <main className="page">
          <div className="confirmation" role="status" aria-live="polite">
            <span className="confirmation__icon" aria-hidden="true">✅</span>
            <h1>Booking Confirmed!</h1>
            <p>Your booking for <strong>{car_name || 'your selected car'}</strong> has been confirmed.</p>
            <p className="confirmation__id">Booking ID: <code>{confirmed.booking_id}</code></p>
            <a href="/" className="confirmation__link">Browse more cars</a>
          </div>
          <style jsx>{`
            .page { max-width: 600px; margin: 4rem auto; padding: 1rem; font-family: system-ui, sans-serif; text-align: center; }
            .confirmation { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 2.5rem; }
            .confirmation__icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
            h1 { font-size: 1.75rem; font-weight: 800; color: #15803d; margin: 0 0 0.75rem; }
            p { color: #374151; margin: 0.25rem 0; }
            .confirmation__id { margin-top: 1rem; font-size: 0.875rem; color: #6b7280; }
            code { background: #e5e7eb; padding: 0.2rem 0.4rem; border-radius: 4px; }
            .confirmation__link { display: inline-block; margin-top: 1.5rem; color: #2563eb; font-weight: 600; }
          `}</style>
        </main>
      </>
    );
  }

  return (
    <>
      <Head><title>Book a Car — Car Reservation</title></Head>
      <main className="page">
        <a href="/" className="back-link">← Back to cars</a>
        <h1>Book {car_name || 'a Car'}</h1>

        {globalError && (
          <div className="global-error" role="alert">{globalError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="form">
          <div className="form__field">
            <DatePicker
              startDate={form.startDate}
              endDate={form.endDate}
              onStartChange={(v) => setForm((f) => ({ ...f, startDate: v }))}
              onEndChange={(v)   => setForm((f) => ({ ...f, endDate: v }))}
              error={errors.startDate || errors.endDate || null}
            />
          </div>

          <div className="form__field">
            <label htmlFor="email" className="form__label">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
              className="form__input"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            <FieldError message={errors.email} />
          </div>

          <div className="form__field">
            <label htmlFor="name" className="form__label">
              Full Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              autoComplete="name"
              className="form__input"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            <FieldError message={errors.name} />
          </div>

          <button
            type="submit"
            disabled={!isFormComplete || submitting}
            className="form__submit"
            aria-busy={submitting}
          >
            {submitting ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </form>
      </main>

      <style jsx>{`
        .page { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; font-family: system-ui, sans-serif; }
        .back-link { color: #2563eb; font-size: 0.875rem; text-decoration: none; display: inline-block; margin-bottom: 1.5rem; }
        h1 { font-size: 1.75rem; font-weight: 800; color: #111; margin: 0 0 1.75rem; }
        .global-error { background: #fee2e2; color: #b91c1c; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.9rem; }
        .form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form__field { display: flex; flex-direction: column; gap: 0.35rem; }
        .form__label { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .form__input { padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; color: #111; transition: border-color 0.15s; }
        .form__input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .form__submit { padding: 0.75rem 1.5rem; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s, opacity 0.2s; }
        .form__submit:hover:not(:disabled) { background: #1d4ed8; }
        .form__submit:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>
    </>
  );
}
