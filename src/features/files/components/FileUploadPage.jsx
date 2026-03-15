import { useState, useRef, useCallback } from "react";
import {
  Box, Card, CardContent, CircularProgress, Divider,
  Grid, IconButton, LinearProgress, List, ListItem, ListItemAvatar,
  ListItemText, Menu, MenuItem, Stack, Typography, Avatar, Button,
} from "@mui/material";

import SvgColor from "src/components/svg-color";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import {
  useFiles, useStorageStats, uploadFiles, deleteFile,
  getDownloadUrl, getFileType, formatSize, formatDate, FILE_TYPES,
} from "../services/fileService";

// ─── All known exts for "other" bucket ───────────────────────────────────────
const ALL_KNOWN_EXTS = Object.values(FILE_TYPES).flatMap((t) => t.exts);

// ─── Storage provider card ────────────────────────────────────────────────────
function StorageProviderCard({ name, icon, used, total, color }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, minWidth: 160 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <IconButton size="small" sx={{ color: "text.secondary", p: 0 }}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon="mdi:dots-vertical" width={18} />
          </IconButton>
          <Box sx={{ width: 44, height: 44, borderRadius: 2,
            bgcolor: color + "18", display: "flex",
            alignItems: "center", justifyContent: "center" }}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon={icon} width={26} sx={{ color }} />
          </Box>
        </Stack>
        <Typography variant="subtitle1" fontWeight={700} mb={0.5}>{name}</Typography>
        <LinearProgress variant="determinate" value={pct}
          sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": { bgcolor: color } }} />
        <Typography variant="caption" color="text.secondary">
          Gb {(total / 1024 ** 3).toFixed(2)} / Gb {(used / 1024 ** 3).toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Single file progress row ─────────────────────────────────────────────────
function FileProgressItem({ file, progress, status }) {
  const ft      = getFileType(file.name);
  const isDone  = status === "success";
  const isError = status === "error";
  const isActive = !isDone && !isError;

  return (
    <Box sx={{
      p: 1.5, borderRadius: 1.5,
      bgcolor: isDone ? "#f0fdf4" : isError ? "#fff1f2" : "grey.50",
      border: "1px solid",
      borderColor: isDone ? "#86efac" : isError ? "#fca5a5" : "divider",
      transition: "all 0.3s ease",
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {/* Icon */}
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
          bgcolor: ft.color + "18", display: "flex",
          alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon={ft.icon} width={18} sx={{ color: ft.color }} />
        </Box>

        {/* Progress info */}
        <Box flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: "68%" }}>
              {file.name}
            </Typography>
            <Typography variant="caption" fontWeight={700}
              color={isDone ? "success.main" : isError ? "error.main" : "primary.main"}>
              {isDone ? "✓ تم" : isError ? "✗ خطأ" : `${progress}%`}
            </Typography>
          </Stack>

          {/* Bar */}
          {isActive && (
            <LinearProgress
              variant={progress === 0 ? "indeterminate" : "determinate"}
              value={progress}
              sx={{
                height: 5, borderRadius: 3,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "primary.main",
                  transition: "width 0.12s linear",
                },
              }}
            />
          )}
          {isDone && <Box sx={{ height: 5, borderRadius: 3, bgcolor: "#86efac" }} />}
          {isError && <Box sx={{ height: 5, borderRadius: 3, bgcolor: "#fca5a5" }} />}

          <Typography variant="caption" color="text.disabled" display="block" mt={0.3}>
            {formatSize(file.size)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ─── Upload drop zone ─────────────────────────────────────────────────────────
function UploadZone({ onFilesSelected, uploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
  }, [onFilesSelected]);

  return (
    <Card
      variant="outlined"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      sx={{
        borderRadius: 2, borderStyle: "dashed", borderWidth: 2,
        borderColor: dragging ? "primary.main" : uploading ? "success.light" : "divider",
        bgcolor: dragging ? "primary.lighter" : "grey.50",
        transition: "all 0.2s ease",
        cursor: uploading ? "default" : "pointer",
        pointerEvents: uploading ? "none" : "auto",
      }}
    >
      <CardContent sx={{ py: 3, textAlign: "center" }}>
        <Stack alignItems="center" spacing={1}>
          <Box sx={{
            width: 52, height: 52, borderRadius: "50%",
            bgcolor: uploading ? "primary.lighter" : "grey.200",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.3s",
          }}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon="mdi:cloud-upload" width={26}
              sx={{ color: uploading ? "primary.main" : "text.secondary" }} />
          </Box>
          <Typography variant="body2" fontWeight={500}
            color={uploading ? "primary.main" : "text.secondary"}>
            {uploading ? "جاري الرفع..." : "Upload file"}
          </Typography>
          {!uploading && (
            <Typography variant="caption" color="text.disabled">
              اسحب وأفلت أو اضغط للاختيار
            </Typography>
          )}
        </Stack>
        <input ref={inputRef} type="file" multiple hidden
          onChange={(e) => e.target.files?.length && onFilesSelected(e.target.files)} />
      </CardContent>
    </Card>
  );
}

// ─── Storage gauge ────────────────────────────────────────────────────────────
function StorageGauge({ used, total }) {
  const pct    = total > 0 ? Math.round((used / total) * 100) : 0;
  const usedGb  = (used  / 1024 ** 3).toFixed(2);
  const totalGb = (total / 1024 ** 3).toFixed(2);
  const r = 54, stroke = 10;
  const circ   = 2 * Math.PI * r;
  const dash   = circ * 0.75;
  const filled = dash * pct / 100;

  return (
    <Box sx={{ position: "relative", display: "inline-flex",
      alignItems: "center", justifyContent: "center" }}>
      <svg width={140} height={140} style={{ transform: "rotate(135deg)" }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="#ede7f6"
          strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <circle cx={70} cy={70} r={r} fill="none" stroke="#9c27b0"
          strokeWidth={stroke} strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
      </svg>
      <Box sx={{ position: "absolute", textAlign: "center" }}>
        <Typography variant="h5" fontWeight={800}>{pct}%</Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Used of {usedGb} Gb / {totalGb} Gb
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Type breakdown row ───────────────────────────────────────────────────────
function TypeBreakdownRow({ label, count, size, icon, color }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" py={0.8}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 34, height: 34, borderRadius: 1.5,
          bgcolor: color + "20", display: "flex",
          alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon={icon} width={18} sx={{ color }} />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          <Typography variant="caption" color="text.secondary">files {count}</Typography>
        </Box>
      </Stack>
      <Typography variant="body2" fontWeight={600} color="text.secondary">
        {formatSize(size)}
      </Typography>
    </Stack>
  );
}

// ─── Recent file row ──────────────────────────────────────────────────────────
function RecentFileRow({ file, onDelete, onDownload }) {
  const [anchor, setAnchor] = useState(null);
  const ft = getFileType(file.name);

  return (
    <ListItem alignItems="flex-start" divider sx={{ px: 0, py: 1.2 }}
      secondaryAction={
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ color: "text.secondary" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:dots-vertical" width={18} />
        </IconButton>
      }>
      <ListItemAvatar>
        <Avatar variant="rounded"
          sx={{ bgcolor: ft.color + "20", width: 44, height: 44, borderRadius: 1.5 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon={ft.icon} width={22} sx={{ color: ft.color }} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 260 }}>
            {file.name}
          </Typography>
        }
        secondary={
          <Stack direction="row" spacing={1} alignItems="center" mt={0.3}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(file.modified)}
            </Typography>
            <Typography variant="caption" color="text.disabled">•</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatSize(file.size)}
            </Typography>
          </Stack>
        }
      />
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 140 } }}>
        <MenuItem onClick={() => { onDownload(file); setAnchor(null); }}
          sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:download" width={18} />
          تحميل
        </MenuItem>
        <MenuItem onClick={() => { onDelete(file); setAnchor(null); }}
          sx={{ gap: 1.5, fontSize: 14, color: "error.main" }}>
          <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />
          حذف
        </MenuItem>
      </Menu>
    </ListItem>
  );
}

// ─── Folder card ──────────────────────────────────────────────────────────────
function FolderCard({ folder }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, cursor: "pointer",
      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
      transition: "box-shadow 0.2s" }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon="mdi:dots-vertical" width={18} />
          </IconButton>
          <IconButton size="small"
            sx={{ p: 0, color: folder.starred ? "#ffc107" : "text.disabled" }}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon={folder.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
          </IconButton>
        </Stack>
        <Box sx={{ textAlign: "right", mb: 1.5 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:folder" width={46} sx={{ color: "#ffa726" }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700} textAlign="right" mb={0.3}>
          {folder.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="right">
          files {folder.fileCount || 0} • {formatSize(folder.size)}
        </Typography>
        {folder.shared?.length > 0 && (
          <Stack direction="row" spacing={-0.5} mt={1} justifyContent="flex-end">
            {folder.shared.slice(0, 3).map((u, i) => (
              <Avatar key={i} src={u.avatarUrl} alt={u.name}
                sx={{ width: 24, height: 24, fontSize: "0.65rem",
                  border: "2px solid white", bgcolor: "primary.light" }}>
                {u.name?.[0]}
              </Avatar>
            ))}
            {folder.shared.length > 3 && (
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem",
                border: "2px solid white", bgcolor: "grey.400" }}>
                +{folder.shared.length - 3}
              </Avatar>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FileUploadPage() {
  const { files, isLoading } = useFiles();
  const { stats }            = useStorageStats();
  const { showSuccess, showError } = useSnackbar();

  // Upload state — track each file individually
  const [uploading, setUploading]       = useState(false);
  const [fileQueue, setFileQueue]       = useState([]); // [{ file, progress, status }]
  const [overallPct, setOverallPct]     = useState(0);

  // Storage
  const totalStorage = stats?.total || 44.7  * 1024 ** 3;
  const usedStorage  = stats?.used  || 22.35 * 1024 ** 3;

  // Breakdown
  const breakdown = [
    { label: "Images",    key: "image",  icon: "mdi:image",         color: "#4caf50" },
    { label: "Media",     key: "video",  icon: "mdi:play-circle",   color: "#f44336" },
    { label: "Documents", key: "word",   icon: "mdi:file-document", color: "#ff9800" },
    { label: "Other",     key: "other",  icon: "mdi:file",          color: "#90a4ae" },
  ].map((b) => {
    const typeExts = FILE_TYPES[b.key]?.exts || [];
    const matching = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return b.key === "other"
        ? !ALL_KNOWN_EXTS.includes(ext)
        : typeExts.includes(ext);
    });
    return { ...b, count: matching.length,
      size: matching.reduce((s, f) => s + (f.size || 0), 0) };
  });

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.modified) - new Date(a.modified))
    .slice(0, 5);

  // ── Upload with per-file progress ──────────────────────────────────────────
  const handleUpload = useCallback(async (fileList) => {
    const arr = Array.from(fileList);

    // Initialize queue with all files at 0%
    const initial = arr.map((f) => ({ file: f, progress: 0, status: "uploading" }));
    setFileQueue(initial);
    setOverallPct(0);
    setUploading(true);

    try {
      const results = await uploadFiles(arr, "", (pct) => {
        // overall progress → spread evenly across all files visually
        setOverallPct(pct);
        setFileQueue((prev) =>
          prev.map((item) => ({
            ...item,
            progress: item.status === "uploading" ? Math.min(pct, 99) : item.progress,
          }))
        );
      });

      // Mark each file done/error based on results array
      const resultArr = Array.isArray(results) ? results : [results];
      setFileQueue((prev) =>
        prev.map((item, idx) => {
          const r = resultArr[idx];
          return {
            ...item,
            progress: 100,
            status: r?.status === "success" ? "success" : "error",
          };
        })
      );

      const okCount = resultArr.filter((r) => r?.status === "success").length;
      showSuccess(`تم رفع ${okCount} من ${arr.length} ملف بنجاح ✓`, 3500);
    } catch (err) {
      setFileQueue((prev) =>
        prev.map((item) => ({ ...item, status: "error", progress: 0 }))
      );
      showError(err?.message || "حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
      setOverallPct(100);
    }
  }, [showSuccess, showError]);

  const handleClearQueue = () => {
    setFileQueue([]);
    setOverallPct(0);
  };

  const handleDownload = (file) => {
    const a = document.createElement("a");
    a.href = getDownloadUrl(file.name);
    a.download = file.name;
    a.click();
  };

  const handleDelete = async (file) => {
    try {
      await deleteFile(file.name);
      showSuccess("تم حذف الملف", 2000);
    } catch {
      showError("حدث خطأ");
    }
  };

  const mockFolders = [
    { name: "Work",     fileCount: 300, size: 762.94 * 1024 ** 2, starred: false },
    { name: "Projects", fileCount: 200, size: 1.12   * 1024 ** 3, starred: true  },
    { name: "Docs",     fileCount: 100, size: 2.24   * 1024 ** 3, starred: true  },
  ];

  const doneCount  = fileQueue.filter((f) => f.status === "success").length;
  const errorCount = fileQueue.filter((f) => f.status === "error").length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>

        {/* ── LEFT SIDEBAR ── */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Stack spacing={2.5}>

            {/* Storage providers */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <StorageProviderCard name="OneDrive" icon="mdi:microsoft-onedrive"
                color="#0078d4" used={11.18 * 1024 ** 3} total={22.35 * 1024 ** 3} />
              <StorageProviderCard name="Drive" icon="mdi:google-drive"
                color="#4285f4" used={4.47 * 1024 ** 3} total={22.35 * 1024 ** 3} />
              <StorageProviderCard name="Dropbox" icon="mdi:dropbox"
                color="#0061ff" used={2.24 * 1024 ** 3} total={22.35 * 1024 ** 3} />
            </Stack>

            {/* Drop zone */}
            <UploadZone onFilesSelected={handleUpload} uploading={uploading} />

            {/* ── Upload progress panel ── */}
            {fileQueue.length > 0 && (
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  {/* Header */}
                  <Stack direction="row" alignItems="center"
                    justifyContent="space-between" mb={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        رفع الملفات
                      </Typography>
                      {uploading && (
                        <CircularProgress size={14} thickness={5} />
                      )}
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption"
                        color={errorCount > 0 ? "error.main" : "success.main"}>
                        {doneCount}/{fileQueue.length}
                        {errorCount > 0 && ` • ${errorCount} خطأ`}
                      </Typography>
                      {!uploading && (
                        <Button size="small" onClick={handleClearQueue}
                          sx={{ minWidth: 0, fontSize: "0.7rem", py: 0.2, px: 1 }}>
                          مسح
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  {/* Overall progress bar */}
                  {uploading && (
                    <Box mb={2}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          الإجمالي
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.main">
                          {overallPct}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={overallPct}
                        sx={{
                          height: 7, borderRadius: 4,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                            transition: "width 0.12s linear",
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Per-file list */}
                  <Stack spacing={1}>
                    {fileQueue.map((item, i) => (
                      <FileProgressItem
                        key={i}
                        file={item.file}
                        progress={item.progress}
                        status={item.status}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Storage gauge */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <StorageGauge used={usedStorage} total={totalStorage} />
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <Stack divider={<Divider />}>
                  {breakdown.map((b) => (
                    <TypeBreakdownRow key={b.key}
                      label={b.label} icon={b.icon} color={b.color}
                      count={b.count} size={b.size} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* ── RIGHT CONTENT ── */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Stack spacing={3}>

            {/* Folders */}
            <Box>
              <Stack direction="row" alignItems="center"
                justifyContent="space-between" mb={2}>
                <Button variant="text" size="small"
                  startIcon={<SvgColor src="/assets/icons/components/ic_default.svg"
                    icon="mdi:chevron-right" width={18} />}
                  sx={{ color: "text.primary", fontWeight: 600 }}>
                  View all
                </Button>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 26, height: 26, borderRadius: "50%",
                    bgcolor: "success.main", display: "flex",
                    alignItems: "center", justifyContent: "center" }}>
                    <SvgColor src="/assets/icons/components/ic_default.svg"
                      icon="mdi:plus" width={16} sx={{ color: "white" }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>Folders</Typography>
                </Stack>
              </Stack>
              <Grid container spacing={2}>
                {mockFolders.map((f) => (
                  <Grid item xs={12} sm={4} key={f.name}>
                    <FolderCard folder={f} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Recent files */}
            <Box>
              <Stack direction="row" alignItems="center"
                justifyContent="space-between" mb={2}>
                <Button variant="text" size="small"
                  startIcon={<SvgColor src="/assets/icons/components/ic_default.svg"
                    icon="mdi:chevron-right" width={18} />}
                  sx={{ color: "text.primary", fontWeight: 600 }}>
                  View all
                </Button>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 26, height: 26, borderRadius: "50%",
                    bgcolor: "info.main", display: "flex",
                    alignItems: "center", justifyContent: "center" }}>
                    <SvgColor src="/assets/icons/components/ic_default.svg"
                      icon="mdi:plus" width={16} sx={{ color: "white" }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>Recent files</Typography>
                </Stack>
              </Stack>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  {isLoading ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : recentFiles.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        لا توجد ملفات حديثة
                      </Typography>
                    </Box>
                  ) : (
                    <List disablePadding sx={{ px: 2 }}>
                      {recentFiles.map((file) => (
                        <RecentFileRow key={file.name} file={file}
                          onDownload={handleDownload}
                          onDelete={handleDelete} />
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
