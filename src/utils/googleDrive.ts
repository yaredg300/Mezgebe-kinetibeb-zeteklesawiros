/**
 * Google Drive Integration for መዝገበ ኪነጥበብ (Tekle Sawiros Sunday School Archive)
 * Provides authentication token resolution, file upload, file browsing, and import.
 */

import { WorkItem } from '../types';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

const DRIVE_FOLDER_NAME = 'መዝገበ ኪነጥበብ - ተክለ ሣዊሮስ';

/**
 * Searches for or creates the dedicated Sunday School Archive folder in Google Drive
 */
export async function getOrCreateArchiveFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent(
    `name = '${DRIVE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ከ Google Drive አቃፊ መፈለግ አልተቻለም');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create the folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብና የክፍላት ሰነዶች ቋሚ ዲጂታል ማህደር',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'አቃፊውን በ Google Drive መፍጠር አልተቻለም');
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * Uploads a WorkItem archival document into Google Drive with metadata
 */
export async function uploadWorkToGoogleDrive(
  work: WorkItem,
  accessToken: string,
  pdfBlob?: Blob
): Promise<{ fileId: string; webViewLink?: string; filename: string }> {
  const folderId = await getOrCreateArchiveFolder(accessToken);
  const cleanTitle = work.title.replace(/[/\\?%*:|"<>]/g, '_');
  const filename = pdfBlob ? `${cleanTitle}.pdf` : `${cleanTitle}.txt`;
  const mimeType = pdfBlob ? 'application/pdf' : 'text/plain; charset=utf-8';

  const metadata = {
    name: filename,
    parents: [folderId],
    description: `የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት መዝገብ - ምድብ፦ ${work.categoryName} • ደራሲ፦ ${work.writerName} • ቀን፦ ${work.dateAmharic}`,
    properties: {
      workId: work.id,
      category: work.categoryName,
      division: work.division,
      writer: work.writerName,
      departmentId: work.departmentId || 'kinetibeb',
    },
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let body: BodyInit;
  if (pdfBlob) {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const metadataPart = new Blob(
      [
        delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType}\r\n\r\n`,
      ],
      { type: 'text/plain' }
    );
    const closePart = new Blob([closeDelimiter], { type: 'text/plain' });
    body = new Blob([metadataPart, arrayBuffer, closePart]);
  } else {
    const contentString = `ርዕስ፦ ${work.title}\nደራሲ፦ ${work.writerName}\nምድብ፦ ${work.categoryName}\nቀን፦ ${work.dateAmharic}\nየዕድሜ እርከን፦ ${work.division}\n\n=========================================\n\n${work.content}\n\n=========================================\nየተክለ ሣዊሮስ ሰንበት ትምህርት ቤት ቋሚ ዲጂታል መዝገብ (፲፱፻፶፯ ዓ.ም.)`;
    body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      contentString +
      closeDelimiter;
  }

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ወደ Google Drive መላክ አልተቻለም');
  }

  const data = await uploadRes.json();
  return {
    fileId: data.id,
    webViewLink: data.webViewLink,
    filename,
  };
}

/**
 * Lists documents from Google Drive for browsing or importing into the archive
 */
export async function listGoogleDriveFiles(accessToken: string): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent(
    "mimeType != 'application/vnd.google-apps.folder' and trashed = false"
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=25&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ፋይሎችን ከ Google Drive ማንበብ አልተቻለም');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Reads text content or exports Google Doc to text from Google Drive
 */
export async function readGoogleDriveFileText(
  fileId: string,
  mimeType: string,
  accessToken: string
): Promise<string> {
  let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'የፋይሉን ይዘት ማውረድ አልተቻለም');
  }

  return await res.text();
}
