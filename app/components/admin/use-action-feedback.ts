// app/components/admin/use-action-feedback.ts
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';

import type { ActionResult } from '~/schemas/common';

/** Toast sekali per hasil action. `onOk` dipanggil saat berhasil, mis. menutup dialog. */
export function useActionToast(result: ActionResult | undefined, onOk?: () => void) {
  const handled = useRef<unknown>(null);
  useEffect(() => {
    if (!result || handled.current === result) return;
    handled.current = result;
    if (result.ok) {
      if (result.message) toast.success(result.message); // pesan kosong = aksi senyap
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

/**
 * Toast dari parameter ?info=... setelah redirect (mis. setelah membuat atau menghapus).
 * Parameternya dibuang dari alamat supaya tidak muncul lagi saat dimuat ulang.
 */
export function useFlashToast(messages: Record<string, string>) {
  const [params, setParams] = useSearchParams();
  const info = params.get('info');
  useEffect(() => {
    if (!info) return;
    const message = messages[info];
    if (message) toast.success(message, { id: `flash-${info}` });
    setParams(
      (prev) => {
        prev.delete('info');
        return prev;
      },
      { replace: true },
    );
  }, [info]);
}
