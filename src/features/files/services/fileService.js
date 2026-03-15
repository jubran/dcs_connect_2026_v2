import useSWR, { mutate as globalMutate } from "swr";
import axiosInstance, { fetcher } from "src/shared/utils/axios";
import API_ROUTES from "src/shared/utils/API_ROUTES";

// ─── Refresh helpers ──────────────────────────────────────────────────────────
export const refreshFiles   = (folder = "") => globalMutate(API_ROUTES.files.listAll(folder));
export const refreshFolders = () => globalMutate(API_ROUTES.files.listFolders());
export const refreshStats   = () => globalMutate(API_ROUTES.files.stats());

// ─── SWR hooks ────────────────────────────────────────────────────────────────
export function useFiles(folder = "") {
  const { data, error, isLoading, mutate } = useSWR(
    API_ROUTES.files.listAll(folder),
    fetcher,
  );
  // Guard: API may return {success, data:[]} wrapper or a plain array
  const files = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return { files, isLoading, isError: !!error, mutate };
}

// Alias — fetch files inside a specific folder (used for folder browsing)
export const useFilesInFolder = useFiles;

export function useFolders() {
  const { data, error, isLoading, mutate } = useSWR(
    API_ROUTES.files.listFolders(),
    fetcher,
  );
  const folders = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return { folders, isLoading, isError: !!error, mutate };
}

export function useStorageStats() {
  const { data, isLoading } = useSWR(API_ROUTES.files.stats(), fetcher);
  return { stats: data || null, isLoading };
}

// ─── Upload files (multipart) with progress callback ────────────────────────
export async function uploadFiles(fileList, folder = "", onProgress = null) {
  const form = new FormData();
  Array.from(fileList).forEach((f) => form.append("files[]", f));
  if (folder) form.append("folder", folder);

  const response = await axiosInstance.post(API_ROUTES.files.upload(), form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          onProgress(pct, e.loaded, e.total);
        }
      : undefined,
  });
  await refreshFiles(folder);
  await refreshStats();
  return response.data;
}

// ─── Delete file ──────────────────────────────────────────────────────────────
export async function deleteFile(filename, folder = "") {
  const response = await axiosInstance.post(API_ROUTES.files.delete(), {
    filename,
    folder,
  });
  await refreshFiles(folder);
  await refreshStats();
  return response.data;
}

// ─── Rename file ──────────────────────────────────────────────────────────────
export async function renameFile(oldName, newName, folder = "") {
  const response = await axiosInstance.post(API_ROUTES.files.rename(), {
    old_name: oldName,
    new_name: newName,
    folder,
  });
  await refreshFiles(folder);
  return response.data;
}

// ─── Star / unstar ────────────────────────────────────────────────────────────
export async function starFile(filename, starred, folder = "") {
  const response = await axiosInstance.post(API_ROUTES.files.star(), {
    filename,
    starred,
    folder,
  });
  await refreshFiles(folder);
  return response.data;
}

// ─── Create folder ────────────────────────────────────────────────────────────
export async function createFolder(name) {
  const response = await axiosInstance.post(API_ROUTES.files.createFolder(), { name });
  await refreshFolders();
  await refreshStats();
  return response.data;
}

// ─── Move file to folder ─────────────────────────────────────────────────────
export async function moveFile(filename, fromFolder = "", toFolder = "") {
  const response = await axiosInstance.post(API_ROUTES.files.move(), {
    filename,
    from_folder: fromFolder,
    to_folder:   toFolder,
  });
  await refreshFiles(fromFolder);
  await refreshFiles(toFolder);
  await refreshStats();
  return response.data;
}

// ─── Delete folder ────────────────────────────────────────────────────────────
export async function deleteFolder(name) {
  const response = await axiosInstance.post(API_ROUTES.files.deleteFolder(), { name });
  await refreshFolders();
  await refreshStats();
  return response.data;
}

// ─── Download URL helper ──────────────────────────────────────────────────────
export const getDownloadUrl = (filename) => API_ROUTES.files.download(filename);

// ─── File type helpers ────────────────────────────────────────────────────────
export const FILE_TYPES = {
  image:    { exts: ["jpg", "jpeg", "png", "gif", "webp", "svg"], color: "#4caf50", icon: "mdi:image" },
  video:    { exts: ["mp4", "avi", "mov", "mkv", "webm"],         color: "#f44336", icon: "mdi:play-circle" },
  audio:    { exts: ["mp3", "wav", "ogg", "flac", "aac"],         color: "#9c27b0", icon: "mdi:music" },
  pdf:      { exts: ["pdf"],                                       color: "#f44336", icon: "mdi:file-pdf" },
  word:     { exts: ["doc", "docx"],                              color: "#1976d2", icon: "mdi:file-word" },
  excel:    { exts: ["xls", "xlsx", "csv"],                       color: "#2e7d32", icon: "mdi:file-excel" },
  folder:   { exts: [],                                           color: "#ffa726", icon: "mdi:folder" },
  other:    { exts: [],                                           color: "#90a4ae", icon: "mdi:file" },
};

export function getFileType(name, isFolder = false) {
  if (isFolder) return FILE_TYPES.folder;
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return Object.values(FILE_TYPES).find((t) => t.exts.includes(ext)) || FILE_TYPES.other;
}

export function formatSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes >= 1024 ** 3) return `Gb ${(bytes / 1024 ** 3).toFixed(2)}`;
  if (bytes >= 1024 ** 2) return `Mb ${(bytes / 1024 ** 2).toFixed(2)}`;
  if (bytes >= 1024)      return `Kb ${(bytes / 1024).toFixed(1)}`;
  return `${bytes} B`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
  }) + " • " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}
