// app/components/admin/use-image-upload.ts
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { Orientation } from '~/lib/image-rules';
import { uploadMedia } from '~/lib/image.client';
import type { MediaItem } from '~/schemas/media';

/** Unggah satu atau beberapa file berurutan. File gagal dilewati dan diberi toast. */
export function useImageUpload(orientation: Orientation = 'landscape', allowVideo = false) {
  const [state, setState] = useState({ busy: false, percent: 0, current: 0, total: 0 });

  const upload = useCallback(
    async (files: File[]): Promise<MediaItem[]> => {
      if (files.length === 0) return [];
      const done: MediaItem[] = [];
      setState({ busy: true, percent: 0, current: 1, total: files.length });

      for (const [i, file] of files.entries()) {
        setState((s) => ({ ...s, current: i + 1, percent: 0 }));
        try {
          done.push(
            await uploadMedia(file, {
              orientation,
              allowVideo,
              onProgress: (percent) => setState((s) => ({ ...s, percent })),
            }),
          );
        } catch (e) {
          toast.error(`${file.name}: ${e instanceof Error ? e.message : 'Gagal mengunggah'}`);
        }
      }

      setState({ busy: false, percent: 0, current: 0, total: 0 });
      return done;
    },
    [orientation, allowVideo],
  );

  return { ...state, upload };
}
