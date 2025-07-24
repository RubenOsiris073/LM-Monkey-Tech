export const splitFileIntoChunks = (file: File, chunkSize: number = 512 * 1024): Blob[] => {
  const chunks: Blob[] = [];
  let start = 0;
  
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }
  
  return chunks;
};

export const uploadFileInChunks = async (
  file: File,
  url: string,
  metadata: Record<string, any>
): Promise<string[]> => {
  const chunks = splitFileIntoChunks(file);
  const uploadedUrls: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const formData = new FormData();
    formData.append('chunk', chunks[i]);
    formData.append('chunkIndex', i.toString());
    formData.append('totalChunks', chunks.length.toString());
    formData.append('fileName', file.name);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error uploading chunk ${i + 1}/${chunks.length}`);
    }

    const data = await response.json();
    uploadedUrls.push(data.url);
  }

  return uploadedUrls;
};
