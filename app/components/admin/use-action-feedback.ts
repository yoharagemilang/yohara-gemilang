// app/components/admin/use-action-feedback.ts
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import type { ActionResult } from '~/schemas/common';

/** Toast sekali per hasil action. `onOk` dipanggil saat berhasil, mis. menutup dialog. */
export function useActionToast(result: ActionResult | undefined, onOk?: () => void) {
  const handled = useRef<unknown>(null);
  useEffect(() => {
    if (!result || handled.current === result) return;
    handled.current = result;
    if (result.ok) {
      toast.success(result.message);
      onOk?.();
    } else if (result.message) {
      toast.error(result.message);
    }
  }, [result]);
}

/**
 * Pesan error per kolom, hanya dari submit di sesi dialog ini. Dialog dibuat ulang
 * tiap dibuka, jadi hasil lama dari sesi sebelumnya diabaikan.
 */
export function useFreshErrors(result: ActionResult | undefined): Record<string, string> {
  const initial = useRef(result);
  if (result === initial.current || !result || result.ok) return {};
  return result.errors ?? {};
}
