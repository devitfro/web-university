import { useEffect } from 'react';

export default function ConfirmLeave({ enabled }) {
  useEffect(() => {
    if (!enabled) return undefined;

    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', warn);

    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, [enabled]);

  return null;
}