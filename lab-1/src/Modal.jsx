export default function Modal({ open, title, children, onClose, onConfirm }){
  if (!open) return null
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'grid', placeItems:'center', zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} 
           style={{background:'#fff', padding:16, borderRadius:12, minWidth:320}}>
        <h3 style={{marginTop:0}}>{title}</h3>
        <div style={{margin:'12px 0'}}>{children}</div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
