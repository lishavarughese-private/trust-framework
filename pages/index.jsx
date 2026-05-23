// AC: TASK-005 — Car listing page
// Fetches from GET /api/cars. Shows loading skeleton, empty state, and car grid.
// No account required. Page loads within 3 seconds.

import { useState, useEffect } from 'react';
import Head          from 'next/head';
import CarList       from '../components/CarList';
import LoadingSkeleton from '../components/LoadingSkeleton';

const PAGE_SIZE = 12;

export default function HomePage() {
  const [cars,    setCars]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/cars?page=${page}&limit=${PAGE_SIZE}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cars. Please try again.');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCars(data.cars);
          setTotal(data.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Head>
        <title>Available Cars — Car Reservation</title>
        <meta name="description" content="Browse available rental cars and make a booking." />
      </Head>

      <main className="page">
        <header className="page__header">
          <h1>Available Cars</h1>
          <p className="page__subtitle">
            Browse our fleet and book a car in minutes. No account required.
          </p>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton rows={PAGE_SIZE} />
        ) : (
          <>
            <CarList cars={cars} />

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span aria-current="page">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: system-ui, sans-serif;
        }
        .page__header  { margin-bottom: 2rem; }
        .page__header h1 { font-size: 2rem; font-weight: 800; color: #111; margin: 0 0 0.5rem; }
        .page__subtitle  { color: #6b7280; margin: 0; }
        .error-banner {
          background: #fee2e2;
          color: #b91c1c;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 2.5rem;
        }
        .pagination button {
          padding: 0.5rem 1.25rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fff;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .pagination button:disabled { opacity: 0.4; cursor: default; }
        .pagination span { font-size: 0.875rem; color: #374151; }
      `}</style>
    </>
  );
}
