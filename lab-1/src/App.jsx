import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Songs } from './api'
import Modal from './Modal.jsx'
import Pagination from './Pagination.jsx'


export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', artist: '', album: '', year: '' });
  const [filterArtist, setFilterArtist] = useState('');

  const [errors, setErrors] = useState({});
  const [searchQ, setSearchQ] = useState(q);

  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Отримуємо id з URL
  const parseId = () => ( id === undefined ? null : 
    ( Number.isFinite(Number(id)) ? Number(id) : null ));

  const validate = (form) => {
    const e = {};

    if (!form.title?.trim()) {
      e.title = 'Title is required';
    }
    if (!form.artist?.trim()) {
      e.artist = 'Artist is required';
    }

    if (!form.album?.trim()) {
      e.album = 'Album is required';
    }

    if (!form.year) { 
      e.year = 'Year is required';
    }

    return e;
  };

  // Завантаження пісень
  const load = async () => {
    try {
      setLoading(true);

      // const list = await Songs.list(q ? { q } : {});
      const list = await Songs.list();

      setItems(list);

      const pid = parseId();

      if (pid != null) {
        const song = list.find(item => Number(item.id) === pid);

        if (song) {
          setForm({
            title: song.title || '',
            artist: song.artist || '',
            album: song.album || '',
            year: song.year || ''
          });
        }
        else {
          navigate('/songs', { replace: true });
        }
      }
      else {
        setForm({
          title: '',
          artist: '',
          album: '',
          year: ''
        })
      }
    }
    catch (error) {
      console.error('Loading error:', error);
    }
    finally {
      setLoading(false);
    }
  };

  // Завантажуємо дані при зміні URL або пошуку
  useEffect(() => { 
    setSearchQ(q); 
    load() 
  }, [id, q]); // eslint-disable-line

  // Пошук
  const applySearch = () => {
    const next = (searchQ ?? '').trim();
    setSearchParams(next ? { q: next } : {});
  }

  // Додавання або редагування
  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = { 
      ...form, 
      title: form.title.trim(), 
      artist: form.artist.trim(),
      album: form.album.trim(),
      year: Number(form.year)
    };

    const eMap = validate(payload); 
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    // Редагування
    const pid = parseId();
    if (pid != null) {
      await Songs.update(pid, payload)
      navigate('/songs' + (q ? `?q=${encodeURIComponent(q)}` : ''), { replace: true });
    } else {
      await Songs.create(payload);
    }
    setForm({ 
      title: '', 
      artist:'', 
      album:'', 
      year:''
    });

    load();
  }

  // Відкрити підтвердження видалення
  const askDelete = (item) => { 
    setToDelete(item); 
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    await Songs.remove(toDelete.id);
    setConfirmOpen(false); 
    setToDelete(null); 
    load();
  };

  // Унікальний список виконавців для фільтра
  const artists = useMemo(() => { 
    return [ ...new Set( items .map(item => item.artist) .filter(Boolean) ) ].sort() }, [items]);
  
  // Фільтрація за виконавцем
  const filtered = useMemo(() => {
    let result = items;

    if (q) {
      const search = q.toLowerCase();

      result = result.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.artist.toLowerCase().includes(search) ||
        item.album.toLowerCase().includes(search)
      );
    }

    if (filterArtist) {
      result = result.filter(item => item.artist === filterArtist);
    }

    return result;
  }, [items, q, filterArtist]);

  // Сортування
  const sorted = useMemo(() => [...filtered].sort((a,b)=>{
    const A = (a[sortBy] || '').toString().toLowerCase();
    const B = (b[sortBy] || '').toString().toLowerCase();

    if (A < B) return sortDir==='asc' ? -1 : 1;
    if (A > B) return sortDir==='asc' ? 1 : -1;
    return 0;
  }), [filtered, sortBy, sortDir]);

  // Загальна кількість
  const total = sorted.length;

  // Дані для поточної сторінки
  const paged = useMemo(() => sorted.slice((page-1)*perPage, (page-1)*perPage + perPage), [sorted, page, perPage]);

  // Скидаємо сторінку при зміні фільтрів
  useEffect(()=>{ setPage(1) }, [filterArtist, sortBy, sortDir, q, perPage]);

  // Зміна сортування
  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir(d => d==='asc'?'desc':'asc');
    }
    else { 
      setSortBy(key); 
      setSortDir('asc') 
    }
  };

  return (
    <div style={{maxWidth:1000, margin:'0 auto', padding:16, fontFamily:'system-ui, sans-serif', background: '#F5EBDD'}}>
      <h1 style={{color: '#413333', margin:'0 auto 34px 0', textAlign: 'center'}}>Music collection — CRUD</h1>

      <div style={{display:'flex', gap:8, marginBottom:12, flexWrap:'wrap'}}>
        <input placeholder="Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') applySearch() }} />
        <button onClick={applySearch}>Find</button>
        <button onClick={() => { setSearchQ(''); setSearchParams({}); }} > Clear </button>

        <select value={filterArtist} onChange={e=>setFilterArtist(e.target.value)}>
          <option value="">All artists</option>
          {artists.map(artist => <option key={artist} value={artist}>{artist}</option>)}
        </select>
        {/* <Link to="/songs">+ New</Link> */}
      </div>

      <form onSubmit={onSubmit} style={{display:'flex', flexDirection:'column', gap:8, padding: '16px', alignItems:'start', marginBottom:16, border: '2px solid #413333'}}>
        <h2 style={{color: '#413333'}}>Add new music:</h2>
        <div>
          <input placeholder="Song title *" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} style={{width: '400px'}}/>
          {errors.title && <div style={{color:'crimson', fontSize:12}}>{errors.title}</div>}
        </div>

        <div>
          <input placeholder="Artist *" value={form.artist} onChange={e=>setForm(f=>({...f, artist:e.target.value}))} style={{width: '400px'}} />
          {errors.artist && <div style={{color:'crimson', fontSize:12}}>{errors.artist}</div>}
        </div>

        <div>
          <input placeholder="Album *" value={form.album} onChange={e=>setForm(f=>({...f, album:e.target.value}))} style={{width: '400px'}} />
          {errors.album && <div style={{color:'crimson', fontSize:12}}>{errors.album}</div>}
        </div>

        <div>
          <input type="number" placeholder="Year *" value={form.year} onChange={e=>setForm(f=>({...f, year:e.target.value}))} style={{width: '400px'}} />
          {errors.year && <div style={{color:'crimson', fontSize:12}}>{errors.year}</div>}
        </div>

        <div style={{display:'flex', gap:8}}>
          <button type="submit">{parseId()!=null ? 'Save' : 'Add'}</button>
          {parseId()!=null && <Link to={'/songs' + (q ? `?q=${encodeURIComponent(q)}` : '')}>Cancel</Link>}
        </div>
      </form>

      {loading ? <p>Loading…</p> : (
        <>
          <table width="100%" style={{borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8, cursor:'pointer'}} onClick={()=>toggleSort('title')}>
                  Title{' '} {sortBy==='title' ? (sortDir==='asc'?'↑':'↓') : ''}
                </th>

                <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8, cursor:'pointer'}} onClick={()=>toggleSort('artist')}>
                  Artist{' '} {sortBy==='artist' ? (sortDir==='asc'?'↑':'↓') : ''}
                </th>
                <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8}}>Album</th>
                <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8}}>Year</th>
                <th style={{borderBottom:'1px solid #ddd', padding:8}}></th>
              </tr>
            </thead>

            <tbody>
              {paged.map(item => (
                <tr key={item.id}>
                  <td style={{borderBottom:'1px solid #f0f0f0', padding:8}}>{item.title}</td>
                  <td style={{borderBottom:'1px solid #f0f0f0', padding:8}}>{item.artist}</td>
                  <td style={{borderBottom:'1px solid #f0f0f0', padding:8}}>{item.album}</td>
                  <td style={{borderBottom:'1px solid #f0f0f0', padding:8}}>{item.year}</td>
                  <td style={{borderBottom:'1px solid #f0f0f0', padding:8, whiteSpace:'nowrap'}}>
                    <Link to={`/songs/${item.id}/edit` + (q ? `?q=${encodeURIComponent(q)}` : '')}>Edit</Link>{' '}
                    <button onClick={()=>askDelete(item)} style={{background:'#fff'}}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination 
            page={page} 
            total={total} 
            perPage={perPage} 
            onPage={setPage} 
            onPerPage={setPerPage} 
          />
        </>
      )}

      <Modal open={confirmOpen} title="Delete song?" onClose={()=>setConfirmOpen(false)} onConfirm={confirmDelete}>
        {toDelete ? <>You are about to delete <strong>{toDelete.title}</strong>. This action cannot be undone.</> : null}
      </Modal>
    </div>
  )
}
