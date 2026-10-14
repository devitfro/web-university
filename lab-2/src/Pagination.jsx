export default function Pagination({
  page,
  total,
  perPage,
  onPage,
  onPerPage,
  t
}) {
  const pages = Math.max(
    1,
    Math.ceil(total / perPage)
  );

  return (
    <div className="pagination">
      <div>
        <button
          onClick={() =>
            onPage(Math.max(1, page - 1))
          }
          disabled={page <= 1}
        >
          ← {t.prev}
        </button>

        <span>
          {' '}{t.page} {page} / {pages}{' '}
        </span>

        <button
          onClick={() =>
            onPage(Math.min(pages, page + 1))
          }
          disabled={page >= pages}
        >
          {t.next} →
        </button>
      </div>

      <label>
        {t.perPage}:{' '}
        <select
          value={perPage}
          onChange={e =>
            onPerPage(Number(e.target.value))
          }
        >
          {[5, 10, 20, 50].map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}