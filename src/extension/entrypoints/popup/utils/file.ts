type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: { suggestedName: string }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Uint8Array<ArrayBuffer>) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

export const saveFile = async (data: Uint8Array<ArrayBuffer>, filename: string) => {
  const saveFilePicker = (window as SaveFilePickerWindow).showSaveFilePicker;

  if (typeof saveFilePicker === 'function') {
    const handle = await saveFilePicker({ suggestedName: filename });
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
    return;
  }

  const url = URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
