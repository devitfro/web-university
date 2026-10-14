
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useBlocker,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

import { Songs } from './api.js';
import { useSettings } from './context/SettingsContext.jsx';
import { translations } from './i18n/translations.js';
import ConfirmLeave from './ConfirmLeave.jsx';
import Modal from './Modal.jsx';
import Pagination from './Pagination.jsx';

const EMPTY = {
  title: '',
  artist: '',
  album: '',
  year: ''
};

const same = (a, b) =>
  JSON.stringify(a) === JSON.stringify(b);

export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    theme,
    language,
    perPage,
    search,
    artist,
    sortBy,
    sortDir,
    updateSettings
  } = useSettings();

  const t = translations[language] ?? translations.uk;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const [searchInput, setSearchInput] = useState(search);
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState('/songs');
  const [saving, setSaving] = useState(false);

  const editId = id ?? null;
  const dirty = !same(form, initialForm);

  const allowNavigationRef = useRef(false);

  const blocker = useBlocker(
    () => dirty && !saving && !allowNavigationRef.current
  );

  useEffect(() => {
    allowNavigationRef.current = false;
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  function changeSettings(patch) {
    updateSettings(patch);
    setPage(1);
  }

  // Завантаження композицій
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const data = await Songs.list();

        if (!active) return;

        setItems(data);

        const song = editId
          ? data.find(
              item => String(item.id) === String(editId)
            )
          : null;

        if (editId && !song) {
          navigate('/songs', { replace: true });
          return;
        }

        const next = song
          ? {
              title: song.title ?? '',
              artist: song.artist ?? '',
              album: song.album ?? '',
              year: String(song.year ?? '')
            }
          : EMPTY;

        setForm(next);
        setInitialForm(next);
        setErrors({});
        setError(null);
      } catch (err) {
        if (active) {
          setError({
            key: 'loadingFailed',
            message: err.message
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [editId, navigate]);

  // Список виконавців
  const artists = useMemo(
    () => [
      ...new Set(
        items.map(item => item.artist).filter(Boolean)
      )
    ].sort(),
    [items]
  );

  // Пошук, фільтрація та сортування
  const sorted = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items
      .filter(item =>
        (
          !query ||
          [item.title, item.artist, item.album].some(
            value =>
              String(value ?? '')
                .toLowerCase()
                .includes(query)
          )
        ) &&
        (!artist || item.artist === artist)
      )
      .sort((a, b) => {
        const result = String(a[sortBy] ?? '')
          .localeCompare(
            String(b[sortBy] ?? ''),
            undefined,
            { numeric: true }
          );

        return (sortDir === 'asc' ? 1 : -1) * result;
      });
  }, [items, search, artist, sortBy, sortDir]);

  // Пагінація
  const pages = Math.max(
    1,
    Math.ceil(sorted.length / perPage)
  );

  const safePage = Math.min(page, pages);

  const paged = sorted.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  const pageIds = paged.map(item => String(item.id));

  const allChecked =
    pageIds.length > 0 &&
    pageIds.every(songId => selectedIds.has(songId));

  // Вибір одного запису
  function toggleOne(songId, checked) {
    setSelectedIds(previous => {
      const next = new Set(previous);

      if (checked) {
        next.add(String(songId));
      } else {
        next.delete(String(songId));
      }

      return next;
    });
  }

  // Вибір усіх записів на сторінці
  function toggleAll(checked) {
    setSelectedIds(previous => {
      const next = new Set(previous);

      pageIds.forEach(songId => {
        if (checked) {
          next.add(songId);
        } else {
          next.delete(songId);
        }
      });

      return next;
    });
  }

  // Перевірка форми
  function validate() {
    const next = {};

    if (!form.title.trim()) {
      next.title = 'titleRequired';
    }

    if (!form.artist.trim()) {
      next.artist = 'artistRequired';
    }

    if (!form.album.trim()) {
      next.album = 'albumRequired';
    }

    const year = Number(form.year);

    if (
      !form.year ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear() + 1
    ) {
      next.year = 'invalidYear';
    }

    return next;
  }

  // Створення або редагування композиції
  async function save(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      artist: form.artist.trim(),
      album: form.album.trim(),
      year: Number(form.year)
    };

    try {
      if (editId) {
        await Songs.update(editId, payload);
      } else {
        await Songs.create(payload);
      }

      const data = await Songs.list();

      setInitialForm(EMPTY);
      setForm(EMPTY);
      setItems(data);

      if (editId) {
        allowNavigationRef.current = true;
        navigate('/songs', { replace: true });
      }
    } catch (err) {
      setError({
        key: 'saveFailed',
        message: err.message
      });
    } finally {
      setSaving(false);
    }
  }

  // Видалення однієї або кількох композицій
  async function confirmDelete() {
    if (!deleteTarget) return;

    setError(null);

    const ids = deleteTarget === 'bulk'
      ? [...selectedIds]
      : [String(deleteTarget.id)];

    const results = await Promise.allSettled(
      ids.map(songId => Songs.remove(songId))
    );

    const failed = results.filter(
      result => result.status === 'rejected'
    ).length;

    try {
      setItems(await Songs.list());
    } catch (err) {
      setError({
        key: 'refreshFailed',
        message: err.message
      });
    }

    if (failed) {
      setError({
        key: 'deleteFailed',
        count: failed
      });
    }

    setSelectedIds(new Set());
    setDeleteTarget(null);
  }

  // Зміна сортування
  function toggleSort(key) {
    changeSettings({
      sortBy: key,
      sortDir:
        sortBy === key && sortDir === 'asc'
          ? 'desc'
          : 'asc'
    });
  }

  // Захист від втрати незбережених змін
  function requestNavigation(path) {
    if (dirty) {
      setPendingPath(path);
      setLeaveOpen(true);
    } else {
      navigate(path);
    }
  }

  function cancelEdit() {
    requestNavigation('/songs');
  }

  function leaveForm() {
    allowNavigationRef.current = true;
    setForm(initialForm);
    setLeaveOpen(false);

    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate(pendingPath);
    }
  }

  function updateForm(key, value) {
    setForm(previous => ({
      ...previous,
      [key]: value
    }));
  }

  return (
    <div className="app-shell">
      <ConfirmLeave enabled={dirty && !saving} />

      <main className="container">
        <header className="header">
          <h1>{t.appTitle}</h1>

          <div className="settings">
            <button
              onClick={() =>
                updateSettings({
                  theme:
                    theme === 'light' ? 'dark' : 'light'
                })
              }
            >
              {theme === 'light'
                ? `🌙 ${t.darkTheme}`
                : `☀️ ${t.lightTheme}`}
            </button>

            <label>
              {t.language}{' '}
              <select
                value={language}
                onChange={e =>
                  updateSettings({
                    language: e.target.value
                  })
                }
              >
                <option value="uk">Українська</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
        </header>

        {/* Пошук */}
        <div className="toolbar">
          <input
            placeholder={t.searchPlaceholder}
            value={searchInput}
            onChange={e =>
              setSearchInput(e.target.value)
            }
            onKeyDown={e => {
              if (e.key === 'Enter') {
                changeSettings({
                  search: searchInput.trim()
                });
              }
            }}
          />

          <button
            onClick={() =>
              changeSettings({
                search: searchInput.trim()
              })
            }
          >
            {t.find}
          </button>

          <button
            onClick={() => {
              setSearchInput('');
              changeSettings({
                search: '',
                artist: ''
              });
            }}
          >
            {t.clear}
          </button>

          <select
            value={artist}
            onChange={e =>
              changeSettings({
                artist: e.target.value
              })
            }
          >
            <option value="">{t.allArtists}</option>

            {artists.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Форма додавання та редагування */}
        <form onSubmit={save} className="song-form">
          <h2>
            {editId ? t.editMusic : t.addMusic}
          </h2>

          {['title', 'artist', 'album', 'year'].map(
            field => (
              <div className="field" key={field}>
                <input
                  type={
                    field === 'year' ? 'number' : 'text'
                  }
                  placeholder={`${t[field]} *`}
                  value={form[field]}
                  onChange={e =>
                    updateForm(field, e.target.value)
                  }
                />

                {errors[field] && (
                  <small className="error">
                    {t[errors[field]]}
                  </small>
                )}
              </div>
            )
          )}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? t.saving
                : editId
                  ? t.save
                  : t.add}
            </button>

            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
              >
                {t.cancel}
              </button>
            )}

            {!editId && dirty && (
              <button
                type="button"
                onClick={() => {
                  setForm(EMPTY);
                  setErrors({});
                }}
              >
                {t.resetForm}
              </button>
            )}
          </div>
        </form>

        {error && (
          <p className="error" role="alert">
            {typeof t[error.key] === 'function'
              ? t[error.key](error.count)
              : `${t[error.key]}: ${error.message}`}
          </p>
        )}

        {loading ? (
          <p>{t.loading}</p>
        ) : (
          <>
            {/* Масове видалення */}
            <div className="bulk-bar">
              <strong>
                {t.songs}: {sorted.length}
              </strong>

              <button
                className="danger"
                disabled={!selectedIds.size}
                onClick={() =>
                  setDeleteTarget('bulk')
                }
              >
                {t.deleteSelected} ({selectedIds.size})
              </button>
            </div>

            {/* Таблиця композицій */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        aria-label={t.deleteSelected}
                        type="checkbox"
                        checked={allChecked}
                        onChange={e =>
                          toggleAll(e.target.checked)
                        }
                      />
                    </th>

                    {[
                      'title',
                      'artist',
                      'album',
                      'year'
                    ].map(key => (
                      <th key={key}>
                        <button
                          className="sort-button"
                          onClick={() =>
                            toggleSort(key)
                          }
                        >
                          {t[key]}{' '}
                          {sortBy === key
                            ? sortDir === 'asc'
                              ? '↑'
                              : '↓'
                            : ''}
                        </button>
                      </th>
                    ))}

                    <th>{t.actions}</th>
                  </tr>
                </thead>

                <tbody>
                  {paged.map(item => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`${t.title}: ${item.title}`}
                          checked={selectedIds.has(
                            String(item.id)
                          )}
                          onChange={e =>
                            toggleOne(
                              item.id,
                              e.target.checked
                            )
                          }
                        />
                      </td>

                      <td>{item.title}</td>
                      <td>{item.artist}</td>
                      <td>{item.album}</td>
                      <td>{item.year}</td>

                      <td className="actions">
                        <button
                          onClick={() =>
                            requestNavigation(
                              `/songs/${item.id}/edit`
                            )
                          }
                        >
                          {t.edit}
                        </button>

                        <button
                          aria-label={`${t.delete}: ${item.title}`}
                          onClick={() =>
                            setDeleteTarget(item)
                          }
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!paged.length && (
                    <tr>
                      <td colSpan="6">
                        {t.noSongs}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              total={sorted.length}
              perPage={perPage}
              onPage={setPage}
              onPerPage={n =>
                changeSettings({
                  perPage: n
                })
              }
              t={t}
            />
          </>
        )}

        {/* Підтвердження видалення */}
        <Modal
          open={Boolean(deleteTarget)}
          title={t.confirmDeletion}
          onClose={() =>
            setDeleteTarget(null)
          }
          onConfirm={confirmDelete}
          cancelText={t.cancel}
          confirmText={t.confirm}
        >
          {deleteTarget && (
            <>
              {deleteTarget === 'bulk'
                ? t.deleteSongs(selectedIds.size)
                : t.deleteSong(deleteTarget.title)}

              {' '}{t.deleteWarning}
            </>
          )}
        </Modal>

        {/* Попередження про незбережені зміни */}
        <Modal
          open={leaveOpen || blocker.state === 'blocked'}
          title={t.unsavedChanges}
          onClose={() => {
            setLeaveOpen(false);

            if (blocker.state === 'blocked') {
              blocker.reset();
            }
          }}
          onConfirm={leaveForm}
          cancelText={t.cancel}
          confirmText={t.confirm}
        >
          {t.leaveWarning}
        </Modal>
      </main>
    </div>
  );
}
