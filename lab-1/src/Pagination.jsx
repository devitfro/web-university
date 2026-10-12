export default function Pagination({ page, total, perPage, onPage, onPerPage }){
  const pages = Math.max(1, Math.ceil(total / perPage))
  const prev = () => onPage(Math.max(1, page - 1))
  const next = () => onPage(Math.min(pages, page + 1))
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
      <div>
        <button onClick={prev} disabled={page<=1}>← Prev</button>
        <span style={{margin:'0 8px'}}>Page {page} / {pages}</span>
        <button onClick={next} disabled={page>=pages}>Next →</button>
      </div>
      <div>
        <label>Per page: </label>
        <select value={perPage} onChange={e=>onPerPage(Number(e.target.value))}>
          {[5,10,20].map(n=> <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  )
}
