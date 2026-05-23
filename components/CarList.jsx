// AC: TASK-005 — Car listing component
// Displays a grid of cars with name, type, and availability status.
// Handles empty state.

import Link from 'next/link';

function AvailabilityBadge({ available }) {
  return (
    <span
      className={`badge ${available ? 'badge--available' : 'badge--unavailable'}`}
      aria-label={available ? 'Available' : 'Unavailable'}
    >
      {available ? 'Available' : 'Unavailable'}

      <style jsx>{`
        .badge {
          display: inline-block;
          padding: 0.2rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge--available   { background: #dcfce7; color: #15803d; }
        .badge--unavailable { background: #fee2e2; color: #b91c1c; }
      `}</style>
    </span>
  );
}

function CarCard({ car }) {
  return (
    <div className="car-card">
      <h2 className="car-card__name">{car.name}</h2>
      <p  className="car-card__type">{car.type}</p>
      <AvailabilityBadge available={car.availability_status} />

      {car.availability_status && (
        <Link
          href={`/book?car_id=${car.id}&car_name=${encodeURIComponent(car.name)}`}
          className="car-card__cta"
        >
          Book this car
        </Link>
      )}

      <style jsx>{`
        .car-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s;
        }
        .car-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .car-card__name { font-size: 1.1rem; font-weight: 700; margin: 0; color: #111; }
        .car-card__type { font-size: 0.9rem; color: #6b7280; margin: 0; }
        .car-card__cta {
          margin-top: 0.75rem;
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #2563eb;
          color: #fff;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          transition: background 0.2s;
        }
        .car-card__cta:hover { background: #1d4ed8; }
      `}</style>
    </div>
  );
}

export default function CarList({ cars }) {
  if (!cars || cars.length === 0) {
    return (
      <div className="empty-state" role="status">
        <p>No cars are currently available. Please check back later.</p>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #6b7280;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="car-grid">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
      <style jsx>{`
        .car-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
      `}</style>
    </div>
  );
}
