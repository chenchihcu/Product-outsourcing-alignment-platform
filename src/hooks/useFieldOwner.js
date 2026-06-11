import { useCallback } from 'react';
import { updateFieldWithOwner, shouldSetOwner } from '../utils/fieldUtils';

export function useFieldOwner(onChange, currentUser) {
  const unit = currentUser?.unit;

  const setField = useCallback((dataPath, value) => {
    if (!unit) {
      if (import.meta.env.DEV) console.warn('[fieldOwner] unit 未設定，欄位儲存已略過：', dataPath);
      return;
    }
    onChange(prev => updateFieldWithOwner(prev, dataPath, value, unit));
  }, [onChange, unit]);

  const setFieldWithExtra = useCallback((dataPath, value, extraChanges) => {
    if (!unit) return;
    onChange(prev => {
      let result = updateFieldWithOwner(prev, dataPath, value, unit);
      if (extraChanges) {
        const owners = { ...(result._owners || {}) };
        for (const [path, val] of Object.entries(extraChanges)) {
          if (shouldSetOwner(val)) {
            owners[path] = unit;
          } else {
            delete owners[path];
          }
        }
        result = { ...result, _owners: owners };
      }
      return result;
    });
  }, [onChange, unit]);

  return { setField, setFieldWithExtra };
}
