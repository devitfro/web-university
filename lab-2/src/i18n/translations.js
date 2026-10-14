export const translations = {
  uk: {
    appTitle: 'Музична колекція — CRUD',
    darkTheme: 'Темна тема',
    lightTheme: 'Світла тема',
    language: 'Мова',

    searchPlaceholder: 'Пошук за назвою, виконавцем, альбомом...',
    find: 'Знайти',
    clear: 'Очистити',
    allArtists: 'Усі виконавці',

    addMusic: 'Додати композицію',
    editMusic: 'Редагувати композицію',
    title: 'Назва',
    artist: 'Виконавець',
    album: 'Альбом',
    year: 'Рік',

    add: 'Додати',
    save: 'Зберегти',
    saving: 'Збереження...',
    cancel: 'Скасувати',
    resetForm: 'Очистити форму',

    songs: 'Композицій',
    deleteSelected: 'Видалити вибрані',
    actions: 'Дії',
    edit: 'Редагувати',
    delete: 'Видалити',
    noSongs: 'Композицій не знайдено',
    loading: 'Завантаження...',

    confirmDeletion: 'Підтвердження видалення',
    confirm: 'Підтвердити',
    deleteWarning: 'Цю дію неможливо скасувати.',

    deleteSongs: count =>
      `Видалити вибрані композиції (${count})?`,

    deleteSong: title =>
      `Видалити композицію «${title}»?`,

    unsavedChanges: 'Незбережені зміни',
    leaveWarning:
      'У вас є незбережені зміни. Вийти без збереження?',

    prev: 'Назад',
    next: 'Далі',
    page: 'Сторінка',
    perPage: 'На сторінці',

    titleRequired: 'Введіть назву композиції',
    artistRequired: 'Введіть виконавця',
    albumRequired: 'Введіть альбом',
    invalidYear: 'Введіть коректний рік',

    loadingFailed: 'Помилка завантаження',
    saveFailed: 'Помилка збереження',
    refreshFailed: 'Помилка оновлення списку',

    deleteFailed: count =>
      `Не вдалося видалити записів: ${count}`
  },

  en: {
    appTitle: 'Music Collection — CRUD',
    darkTheme: 'Dark theme',
    lightTheme: 'Light theme',
    language: 'Language',

    searchPlaceholder: 'Search title, artist, album...',
    find: 'Find',
    clear: 'Clear',
    allArtists: 'All artists',

    addMusic: 'Add new song',
    editMusic: 'Edit song',
    title: 'Title',
    artist: 'Artist',
    album: 'Album',
    year: 'Year',

    add: 'Add',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    resetForm: 'Reset form',

    songs: 'Songs',
    deleteSelected: 'Delete selected',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    noSongs: 'No songs found',
    loading: 'Loading...',

    confirmDeletion: 'Confirm deletion',
    confirm: 'Confirm',
    deleteWarning: 'This action cannot be undone.',

    deleteSongs: count =>
      `Delete ${count} selected songs?`,

    deleteSong: title =>
      `Delete "${title}"?`,

    unsavedChanges: 'Unsaved changes',
    leaveWarning:
      'You have unsaved changes. Leave without saving?',

    prev: 'Prev',
    next: 'Next',
    page: 'Page',
    perPage: 'Per page',

    titleRequired: 'Title is required',
    artistRequired: 'Artist is required',
    albumRequired: 'Album is required',
    invalidYear: 'Enter a valid year',

    loadingFailed: 'Loading failed',
    saveFailed: 'Save failed',
    refreshFailed: 'Refresh failed',

    deleteFailed: count =>
      `Could not delete ${count} song(s)`
  }
};