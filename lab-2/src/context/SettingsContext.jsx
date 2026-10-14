import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

const KEY = 'music_settings_v1';

const defaults = {
  theme: 'light',
  language: 'uk',
  perPage: 5,
  search: '',
  artist: '',
  sortBy: 'title',
  sortDir: 'asc'
};

const SettingsContext = createContext(null);

function initialSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(KEY) || '{}'
    );

    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(initialSettings);

  const updateSettings = (patch) => {
    setSettings(previous => ({
      ...previous,
      ...patch
    }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error(error);
    }

    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  const value = useMemo(
    () => ({
      ...settings,
      updateSettings
    }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      'useSettings must be used inside SettingsProvider'
    );
  }

  return context;
}