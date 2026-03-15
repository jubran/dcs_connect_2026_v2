import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Avatar, AvatarGroup, Box, Button, Card, CardContent, Checkbox,
  Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, IconButton, InputAdornment, Menu, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Collapse,
  LinearProgress,
} from "@mui/material";

import SvgColor from "src/components/svg-color";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import {
  useFiles, useFilesInFolder, useFolders, deleteFile, deleteFolder, renameFile,
  starFile, createFolder, getDownloadUrl, getFileType,
  formatSize, uploadFiles, moveFile,
} from "../services/fileService";

// ─── Inline SVGs ──────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>
  </svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);
const MoreVertIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
);
const ChevronUpIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

// ─── Drop illustration ────────────────────────────────────────────────────────
const DropIllustration = () => (
  <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
    <rect x="20" y="55" width="80" height="38" rx="4" fill="#00AB55" opacity="0.3"/>
    <path d="M20 67 Q60 55 100 67" stroke="#00AB55" strokeWidth="2" fill="none"/>
    <rect x="35" y="42" width="50" height="30" rx="3" fill="#00AB55"/>
    <rect x="28" y="38" width="22" height="10" rx="2" fill="#00AB55"/>
    <rect x="45" y="22" width="18" height="26" rx="2" fill="white" transform="rotate(-10 54 35)"/>
    <rect x="50" y="18" width="18" height="26" rx="2" fill="white" transform="rotate(5 59 31)"/>
    <rect x="55" y="20" width="18" height="26" rx="2" fill="white" transform="rotate(15 64 33)"/>
    <rect x="48" y="26" width="10" height="2" rx="1" fill="#FF6B6B" transform="rotate(-10 53 27)"/>
    <rect x="52" y="24" width="10" height="2" rx="1" fill="#FFD93D" transform="rotate(5 57 25)"/>
    <rect x="57" y="26" width="10" height="2" rx="1" fill="#6BCB77" transform="rotate(15 62 27)"/>
    <circle cx="25" cy="40" r="3" fill="#00AB55" opacity="0.4"/>
    <circle cx="98" cy="35" r="2.5" fill="#00AB55" opacity="0.4"/>
  </svg>
);

// ─── File/Folder icon ─────────────────────────────────────────────────────────
function FileIcon({ name, isFolder, size = 40 }) {
  const ft = getFileType(name, isFolder);
  if (isFolder) return (
    <Box sx={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <path d="M4 10 Q4 6 8 6 L20 6 L24 10 L44 10 L44 38 Q44 42 40 42 L8 42 Q4 42 4 38 Z" fill="#FFA726"/>
        <path d="M4 14 L44 14 L44 38 Q44 42 40 42 L8 42 Q4 42 4 38 Z" fill="#FFB74D"/>
      </svg>
    </Box>
  );
  return (
    <Box sx={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <path d="M10 4 L32 4 L42 14 L42 44 Q42 46 40 46 L10 46 Q8 46 8 44 L8 6 Q8 4 10 4Z" fill={ft.color}/>
        <path d="M32 4 L32 14 L42 14 Z" fill="white" opacity="0.3"/>
        <circle cx="24" cy="30" r="7" fill="white" opacity="0.2"/>
        <path d="M20 30 L24 26 L28 30 L26 30 L26 34 L22 34 L22 30 Z" fill="white" opacity="0.7"/>
      </svg>
    </Box>
  );
}

// ─── Folder card — drop target ────────────────────────────────────────────────
function FolderCard({ item, isSelected, isDropTarget, onSelect, onStar, onRename, onDelete,
  onDragOver, onDragLeave, onDrop }) {
  const [anchor, setAnchor] = useState(null);
  const shared = item.shared || [];
  return (
    <Card variant="outlined"
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      sx={{
        borderRadius: 2.5, position: "relative",
        border: isDropTarget ? "2.5px dashed" : isSelected ? "1.5px solid" : "1px solid",
        borderColor: isDropTarget ? "success.main" : isSelected ? "primary.main" : "divider",
        bgcolor: isDropTarget ? "#f0fdf4" : isSelected ? "primary.lighter" : "background.paper",
        transform: isDropTarget ? "scale(1.04)" : "scale(1)",
        transition: "all 0.18s ease",
        "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
      }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" mb={1.5}>
          <IconButton size="small" sx={{ p: 0.5, color: "text.secondary" }}
            onClick={(e) => setAnchor(e.currentTarget)}><MoreVertIcon /></IconButton>
          <IconButton size="small" sx={{ p: 0.3, color: item.starred ? "#ffc107" : "text.disabled" }}
            onClick={() => onStar(item)}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon={item.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
          </IconButton>
        </Stack>
        <Box sx={{ textAlign: "right", mb: 1.5 }}>
          <FileIcon name={item.name} isFolder size={52} />
          {isDropTarget && (
            <Box sx={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)" }}>
              <SvgColor src="/assets/icons/components/ic_default.svg"
                icon="mdi:folder-open" width={28} sx={{ color: "success.dark", opacity: 0.7 }} />
            </Box>
          )}
        </Box>
        <Typography variant="subtitle2" fontWeight={700} textAlign="right" noWrap mb={0.3}>
          {item.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mb={1}>
          files {item.fileCount || 0} · {formatSize(item.size)}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {shared.length > 0 ? (
            <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: "0.6rem" } }}>
              {shared.map((u, i) => <Avatar key={i} src={u.avatarUrl} sx={{ bgcolor: "primary.light" }}>{u.name?.[0]}</Avatar>)}
            </AvatarGroup>
          ) : <Box />}
          <Checkbox size="small" checked={isSelected} onChange={() => onSelect(item.name)} sx={{ p: 0.3 }} />
        </Stack>
      </CardContent>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 160, borderRadius: 2 } }}>
        <MenuItem onClick={() => { onStar(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon={item.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
          {item.starred ? "إلغاء التمييز" : "تمييز"}
        </MenuItem>
        <MenuItem onClick={() => { onRename(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_edit.svg" width={18} />إعادة التسمية
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14, color: "error.main" }}>
          <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />حذف
        </MenuItem>
      </Menu>
    </Card>
  );
}

// ─── File card — draggable ────────────────────────────────────────────────────
function FileCard({ item, isSelected, isDragging, onSelect, onStar, onRename,
  onDelete, onDownload, onMove, onDragStart, onDragEnd }) {
  const [anchor, setAnchor] = useState(null);
  const shared = item.shared || [];
  return (
    <Card variant="outlined" draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
      sx={{
        borderRadius: 2.5, position: "relative",
        border: isSelected ? "1.5px solid" : "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "primary.lighter" : "background.paper",
        opacity: isDragging ? 0.4 : 1, cursor: "grab",
        transition: "all 0.18s ease",
        "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
        "&:active": { cursor: "grabbing" },
      }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" mb={1.5}>
          <IconButton size="small" sx={{ p: 0.5, color: "text.secondary" }}
            onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}><MoreVertIcon /></IconButton>
          <IconButton size="small" sx={{ p: 0.3, color: item.starred ? "#ffc107" : "text.disabled" }}
            onClick={(e) => { e.stopPropagation(); onStar(item); }}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon={item.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
          </IconButton>
        </Stack>
        <Box sx={{ textAlign: "right", mb: 1.5 }}><FileIcon name={item.name} isFolder={false} size={52} /></Box>

        {/* ── Vertical info block ── */}
        <Stack spacing={0.4} mb={1}>
          {/* File name */}
          <Typography variant="subtitle2" fontWeight={700} textAlign="right" noWrap>
            {item.name}
          </Typography>
          {/* Folder name */}
          {item.folder && (
            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.folder}
              </Typography>
              <SvgColor src="/assets/icons/components/ic_default.svg"
                icon="mdi:folder" width={13} sx={{ color: "#ffa726", flexShrink: 0 }} />
            </Stack>
          )}
          {/* Upload date */}
          <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
            <Typography variant="caption" color="text.secondary">
              {item.modified ? new Date(item.modified).toLocaleDateString("ar-SA",
                { year: "numeric", month: "short", day: "numeric" }) : "—"}
            </Typography>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon="mdi:calendar" width={13} sx={{ color: "text.disabled", flexShrink: 0 }} />
          </Stack>
          {/* Size */}
          <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
            <Typography variant="caption" color="text.secondary">
              {formatSize(item.size)}
            </Typography>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon="mdi:harddisk" width={13} sx={{ color: "text.disabled", flexShrink: 0 }} />
          </Stack>
          {/* Uploaded by */}
          {item.uploadedBy || item.createdBy || item.username ? (
            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.uploadedBy || item.createdBy || item.username}
              </Typography>
              <SvgColor src="/assets/icons/components/ic_default.svg"
                icon="mdi:account" width={13} sx={{ color: "text.disabled", flexShrink: 0 }} />
            </Stack>
          ) : null}
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {shared.length > 0 ? (
            <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: "0.6rem" } }}>
              {shared.map((u, i) => <Avatar key={i} src={u.avatarUrl} sx={{ bgcolor: "primary.light" }}>{u.name?.[0]}</Avatar>)}
            </AvatarGroup>
          ) : <Box />}
          <Checkbox size="small" checked={isSelected} onChange={() => onSelect(item.name)} sx={{ p: 0.3 }} />
        </Stack>
      </CardContent>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 170, borderRadius: 2 } }}>
        <MenuItem onClick={() => { onDownload(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:download" width={18} />تحميل
        </MenuItem>
        <MenuItem onClick={() => { onMove(); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:folder-move" width={18} />
          نقل إلى مجلد
        </MenuItem>
        <MenuItem onClick={() => { onStar(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon={item.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
          {item.starred ? "إلغاء التمييز" : "تمييز"}
        </MenuItem>
        <MenuItem onClick={() => { onRename(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_edit.svg" width={18} />إعادة التسمية
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14, color: "error.main" }}>
          <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />حذف
        </MenuItem>
      </Menu>
    </Card>
  );
}

// ─── Row menu (list view) ─────────────────────────────────────────────────────
function RowMenuList({ item, onDownload, onRename, onDelete, onStar, onMove }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: "text.secondary" }}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 170, borderRadius: 2 } }}>
        {!item.isFolder && (
          <MenuItem onClick={() => { onDownload(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
            <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:download" width={18} />تحميل
          </MenuItem>
        )}
        {!item.isFolder && onMove && (
          <MenuItem onClick={() => { onMove(); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
            <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:folder-move" width={18} />
            نقل إلى مجلد
          </MenuItem>
        )}
        <MenuItem onClick={() => { onStar(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon={item.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
          {item.starred ? "إلغاء التمييز" : "تمييز"}
        </MenuItem>
        <MenuItem onClick={() => { onRename(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_edit.svg" width={18} />إعادة التسمية
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(item); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14, color: "error.main" }}>
          <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />حذف
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Section header (collapsible) ────────────────────────────────────────────
function SectionHeader({ title, count, label, open, onToggle, onAdd }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
      <IconButton size="small" onClick={onToggle} sx={{ color: "text.secondary" }}>
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </IconButton>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button onClick={onAdd}
          sx={{ gap: 0.8, fontWeight: 700, fontSize: "1rem", color: "text.primary",
            textTransform: "none", p: 0, "&:hover": { bgcolor: "transparent", color: "primary.main" } }}
          startIcon={
            <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "success.main",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:plus" width={16} sx={{ color: "white" }} />
            </Box>
          }>{title}</Button>
        <Typography variant="caption" color="text.secondary">{label} {count}</Typography>
      </Stack>
    </Stack>
  );
}

// ─── Upload drop zone ─────────────────────────────────────────────────────────
function DropZone({ onFilesSelected, uploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
  }, [onFilesSelected]);
  return (
    <Box onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)} onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      sx={{ border: "2px dashed", borderRadius: 2.5, borderColor: dragging ? "success.main" : "#e0e0e0",
        bgcolor: dragging ? "#f0fdf4" : "#fafafa", py: 4, px: 2, textAlign: "center",
        cursor: uploading ? "default" : "pointer", transition: "all 0.2s ease" }}>
      <DropIllustration />
      <Typography variant="h6" fontWeight={600} mt={1.5} mb={0.5}>Drop or select files</Typography>
      <Typography variant="body2" color="text.secondary">
        Drag files here, or{" "}
        <Box component="span" sx={{ color: "success.main", textDecoration: "underline", cursor: "pointer" }}>browse</Box>{" "}
        your device.
      </Typography>
      <input ref={inputRef} type="file" multiple hidden
        onChange={(e) => e.target.files?.length && onFilesSelected(e.target.files)} />
    </Box>
  );
}

// ─── Add Files dialog ─────────────────────────────────────────────────────────
function AddFilesDialog({ open, onClose, onUpload, uploading, progress }) {
  return (
    <Dialog open={open} onClose={!uploading ? onClose : undefined} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <IconButton onClick={onClose} disabled={uploading} size="small">
          <SvgColor src="/assets/icons/components/ic_close.svg" width={20} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>Add files</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 1 }}>
        <DropZone onFilesSelected={onUpload} uploading={uploading} />
        {uploading && (
          <Box mt={2}>
            <LinearProgress variant="determinate" value={progress}
              sx={{ height: 6, borderRadius: 3, "& .MuiLinearProgress-bar": { bgcolor: "success.main" } }} />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block" textAlign="center">
              {progress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="contained" disabled={uploading}
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> :
            <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:upload" width={18} />}
          sx={{ bgcolor: "#111", color: "white", borderRadius: 2, fontWeight: 700, "&:hover": { bgcolor: "#333" } }}>
          {uploading ? `${progress}%` : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Add Folder dialog ────────────────────────────────────────────────────────
function AddFolderDialog({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true); await onCreate(name.trim()); setCreating(false); setName("");
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <IconButton onClick={onClose} size="small">
          <SvgColor src="/assets/icons/components/ic_close.svg" width={20} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>Add folder</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 1 }}>
        <TextField autoFocus fullWidth placeholder="Folder name" value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
        <DropZone onFilesSelected={() => {}} uploading={false} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={handleCreate} disabled={!name.trim() || creating}
          sx={{ borderRadius: 2, minWidth: 90 }}>
          {creating ? <CircularProgress size={16} /> : "Create"}
        </Button>
        <Button variant="contained" onClick={onClose}
          sx={{ bgcolor: "#111", color: "white", borderRadius: 2, fontWeight: 700, "&:hover": { bgcolor: "#333" } }}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Move To dialog ───────────────────────────────────────────────────────────
function MoveToDialog({ open, files, folders, onClose, onMove }) {
  const [targetFolder, setTargetFolder] = useState("");
  const [moving, setMoving] = useState(false);

  useEffect(() => { if (!open) setTargetFolder(""); }, [open]);

  const handleMove = async () => {
    if (!targetFolder) return;
    setMoving(true);
    await onMove(targetFolder);
    setMoving(false);
  };

  return (
    <Dialog open={open} onClose={!moving ? onClose : undefined} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <IconButton onClick={onClose} disabled={moving} size="small">
          <SvgColor src="/assets/icons/components/ic_close.svg" width={20} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>نقل إلى مجلد</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 1 }}>

        {/* Files preview */}
        {files.length > 0 && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 2,
            border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
              {files.length === 1 ? "الملف المراد نقله" : `${files.length} ملفات`}
            </Typography>
            <Stack spacing={0.6}>
              {files.slice(0, 4).map((f) => (
                <Stack key={f.name} direction="row" alignItems="center" spacing={1}>
                  <FileIcon name={f.name} isFolder={false} size={20} />
                  <Typography variant="caption" noWrap sx={{ maxWidth: 220 }}>{f.name}</Typography>
                </Stack>
              ))}
              {files.length > 4 && (
                <Typography variant="caption" color="text.secondary">+{files.length - 4} ملفات أخرى</Typography>
              )}
            </Stack>
          </Box>
        )}

        {/* Folder list */}
        <Typography variant="body2" fontWeight={700} mb={1.2}>اختر المجلد الهدف</Typography>
        {folders.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            لا توجد مجلدات — أنشئ مجلداً أولاً
          </Typography>
        ) : (
          <Stack spacing={0.8} sx={{ maxHeight: 280, overflowY: "auto" }}>
            {folders.map((folder) => (
              <Box key={folder.name} onClick={() => setTargetFolder(folder.name)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5, p: 1.2, borderRadius: 2,
                  cursor: "pointer", border: "1.5px solid",
                  borderColor: targetFolder === folder.name ? "primary.main" : "divider",
                  bgcolor: targetFolder === folder.name ? "primary.lighter" : "background.paper",
                  transition: "all 0.15s ease",
                  "&:hover": { borderColor: "primary.light", bgcolor: "action.hover" },
                }}>
                <FileIcon name={folder.name} isFolder size={30} />
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600}>{folder.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {folder.fileCount || 0} ملف · {formatSize(folder.size)}
                  </Typography>
                </Box>
                {targetFolder === folder.name && (
                  <SvgColor src="/assets/icons/components/ic_default.svg"
                    icon="mdi:check-circle" width={20} sx={{ color: "primary.main", flexShrink: 0 }} />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={moving} sx={{ borderRadius: 2 }}>إلغاء</Button>
        <Button variant="contained" onClick={handleMove} disabled={!targetFolder || moving}
          startIcon={moving ? <CircularProgress size={16} color="inherit" /> :
            <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:folder-move" width={18} />}
          sx={{ borderRadius: 2, fontWeight: 700 }}>
          {moving ? "جاري النقل..." : "نقل"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Rename dialog ────────────────────────────────────────────────────────────
function RenameDialog({ open, item, onClose, onSave }) {
  const [name, setName] = useState("");
  useEffect(() => { if (item) setName(item.name); }, [item]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={700}>إعادة التسمية</DialogTitle>
      <DialogContent>
        <TextField autoFocus fullWidth label="الاسم الجديد" value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave(name)}
          sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="contained" onClick={() => onSave(name)} sx={{ borderRadius: 2 }}>حفظ</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Folder Contents View (opened folder) ───────────────────────────────────
function FolderContentsView({
  folderName, viewMode, onBack,
  onRename, onDelete, onStar, onDownload, onMove,
  onDragStart, onDragEnd,
  draggedFile, dropTargetFolder, onFolderDragOver, onFolderDragLeave, onFolderDrop,
}) {
  const { files, isLoading } = useFilesInFolder(folderName);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    return files.filter((f) => f.name?.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  const toggleSelect = (name) => setSelected((p) =>
    p.includes(name) ? p.filter((n) => n !== name) : [...p, name]);

  const headCell = {
    fontWeight: 600, fontSize: "0.8rem", color: "text.secondary",
    bgcolor: "grey.100", whiteSpace: "nowrap", py: 1.5, px: 2,
  };
  const bodyCell = { py: 1.2, px: 2, borderBottom: "1px solid", borderColor: "divider" };

  return (
    <Box>
      {/* ── Breadcrumb + back ── */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <IconButton onClick={onBack}
          sx={{ bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}>
          <BackIcon />
        </IconButton>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 0.5,
          px: 2, py: 0.8, borderRadius: 2,
          bgcolor: "grey.50", border: "1px solid", borderColor: "divider",
        }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:home" width={16} sx={{ color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary"
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
            onClick={onBack}>
            Root
          </Typography>
          <Typography variant="body2" color="text.disabled" mx={0.3}>/</Typography>
          <FileIcon name={folderName} isFolder size={20} />
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {folderName}
          </Typography>
        </Box>
        <Box flex={1} />
        <TextField size="small" placeholder="...Search" value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 220, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            endAdornment: (
              <Box component="span" sx={{ display: "flex", color: "text.disabled" }}>
                <SearchIcon />
              </Box>
            ),
          }} />
      </Stack>

      {/* ── Contents ── */}
      {isLoading ? (
        <Box textAlign="center" py={6}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{
          textAlign: "center", py: 8,
          border: "2px dashed", borderColor: "divider", borderRadius: 3,
        }}>
          <FileIcon name="empty" isFolder={false} size={56} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            هذا المجلد فارغ
          </Typography>
          <Typography variant="body2" color="text.disabled">
            لا توجد ملفات في المجلد "{folderName}"
          </Typography>
        </Box>
      ) : viewMode === "grid" ? (
        // Grid
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
          {filtered.map((item) => (
            <FileCard key={item.name} item={item}
              isSelected={selected.includes(item.name)}
              isDragging={draggedFile?.name === item.name}
              onSelect={toggleSelect} onStar={onStar}
              onRename={onRename} onDelete={onDelete}
              onDownload={onDownload}
              onMove={() => onMove(item)}
              onDragStart={() => onDragStart(item)}
              onDragEnd={onDragEnd} />
          ))}
        </Box>
      ) : (
        // List
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={headCell}>
                    <Checkbox size="small"
                      indeterminate={selected.length > 0 && selected.length < filtered.length}
                      checked={filtered.length > 0 && filtered.every((f) => selected.includes(f.name))}
                      onChange={() => {
                        const all = filtered.every((f) => selected.includes(f.name));
                        setSelected(all ? [] : filtered.map((f) => f.name));
                      }} />
                  </TableCell>
                  <TableCell sx={{ ...headCell, textAlign: "right" }}>
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:arrow-up" width={14} />
                      <span>Name</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...headCell, textAlign: "center" }}>Size</TableCell>
                  <TableCell sx={{ ...headCell, textAlign: "center" }}>Type</TableCell>
                  <TableCell sx={{ ...headCell, textAlign: "center" }}>Modified</TableCell>
                  <TableCell sx={{ ...headCell, width: 80 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((item) => {
                  const ft    = getFileType(item.name, false);
                  const isSel = selected.includes(item.name);
                  return (
                    <TableRow key={item.name} hover selected={isSel}
                      draggable onDragStart={() => onDragStart(item)} onDragEnd={onDragEnd}
                      sx={{
                        opacity: draggedFile?.name === item.name ? 0.35 : 1,
                        cursor: "grab", transition: "all 0.15s",
                        "&.Mui-selected": { bgcolor: "action.selected" },
                      }}>
                      <TableCell padding="checkbox" sx={bodyCell}>
                        <Checkbox size="small" checked={isSel} onChange={() => toggleSelect(item.name)} />
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, textAlign: "right" }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="flex-end">
                          <Stack spacing={0.3} alignItems="flex-end">
                            <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 240 }}>
                              {item.name}
                            </Typography>
                            {item.folder && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">{item.folder}</Typography>
                                <SvgColor src="/assets/icons/components/ic_default.svg"
                                  icon="mdi:folder" width={12} sx={{ color: "#ffa726" }} />
                              </Stack>
                            )}
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="caption" color="text.disabled">
                                {item.modified ? new Date(item.modified).toLocaleDateString("ar-SA",
                                  { year: "numeric", month: "short", day: "numeric" }) : "—"}
                              </Typography>
                              <SvgColor src="/assets/icons/components/ic_default.svg"
                                icon="mdi:calendar" width={12} sx={{ color: "text.disabled" }} />
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="caption" color="text.disabled">{formatSize(item.size)}</Typography>
                              <SvgColor src="/assets/icons/components/ic_default.svg"
                                icon="mdi:harddisk" width={12} sx={{ color: "text.disabled" }} />
                            </Stack>
                            {(item.uploadedBy || item.createdBy || item.username) && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="caption" color="text.disabled" noWrap sx={{ maxWidth: 160 }}>
                                  {item.uploadedBy || item.createdBy || item.username}
                                </Typography>
                                <SvgColor src="/assets/icons/components/ic_default.svg"
                                  icon="mdi:account" width={12} sx={{ color: "text.disabled" }} />
                              </Stack>
                            )}
                          </Stack>
                          <FileIcon name={item.name} isFolder={false} size={34} />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, textAlign: "center", color: "text.secondary", fontSize: "0.83rem" }}>
                        {formatSize(item.size)}
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, textAlign: "center" }}>
                        <Chip label={item.type || "file"} size="small"
                          sx={{ fontSize: "0.72rem", height: 22,
                            bgcolor: ft.color + "18", color: ft.color, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, textAlign: "center", color: "text.secondary", fontSize: "0.8rem" }}>
                        <Typography variant="caption" display="block" fontWeight={500}>
                          {item.modified ? new Date(item.modified).toLocaleDateString("ar-SA",
                            { year: "numeric", month: "long", day: "numeric" }) : "—"}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {item.modified ? new Date(item.modified).toLocaleTimeString("ar-SA",
                            { hour: "2-digit", minute: "2-digit" }) : ""}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, px: 0.5 }}>
                        <Stack direction="row" alignItems="center" spacing={0.3}>
                          <IconButton size="small" onClick={() => onStar(item)}
                            sx={{ color: item.starred ? "#ffc107" : "text.disabled" }}>
                            <SvgColor src="/assets/icons/components/ic_default.svg"
                              icon={item.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
                          </IconButton>
                          <RowMenuList item={item}
                            onDownload={onDownload} onRename={onRename}
                            onDelete={onDelete} onStar={onStar}
                            onMove={() => onMove(item)} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

// ─── TYPE_FILTERS ─────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { value: "all",    label: "All type" },
  { value: "folder", label: "Folders" },
  { value: "image",  label: "Images" },
  { value: "pdf",    label: "PDF" },
  { value: "video",  label: "Video" },
  { value: "audio",  label: "Audio" },
  { value: "word",   label: "Word" },
  { value: "excel",  label: "Excel" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FileManagerPage() {
  const { files: rawFiles, isLoading } = useFiles();
  const { folders }                    = useFolders();
  const { showSuccess, showError }     = useSnackbar();

  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [selected, setSelected]       = useState([]);
  const [viewMode, setViewMode]       = useState("grid");
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [filesOpen, setFilesOpen]     = useState(true);
  const [typeMenuAnchor, setTypeMenuAnchor] = useState(null);

  // dialogs
  const [addFilesOpen, setAddFilesOpen]     = useState(false);
  const [addFolderOpen, setAddFolderOpen]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]           = useState(false);
  const [renameTarget, setRenameTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleting, setDeleting]             = useState(false);

  // folder navigation
  const [currentFolder, setCurrentFolder] = useState(null);
  const handleOpenFolder = useCallback((name) => { setCurrentFolder(name); setSelected([]); }, []);

  // move
  const [moveTargets, setMoveTargets]           = useState([]);
  const [moveDialogOpen, setMoveDialogOpen]     = useState(false);
  // drag state
  const [draggedFile, setDraggedFile]           = useState(null);
  const [dropTargetFolder, setDropTargetFolder] = useState(null);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const folderItems = useMemo(() =>
    (folders || []).map((f) => ({ ...f, isFolder: true, type: "folder" })), [folders]);

  const fileItems = useMemo(() =>
    (rawFiles || []).map((f) => ({ ...f, isFolder: false })), [rawFiles]);

  const filteredFolders = useMemo(() => {
    if (typeFilter !== "all" && typeFilter !== "folder") return [];
    let list = folderItems;
    if (search.trim()) list = list.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [folderItems, typeFilter, search]);

  const filteredFiles = useMemo(() => {
    if (typeFilter === "folder") return [];
    let list = fileItems;
    if (typeFilter !== "all") {
      const exts = getFileType("x." + typeFilter)?.exts || [typeFilter];
      list = list.filter((f) => exts.includes(f.name.split(".").pop()?.toLowerCase()));
    }
    if (search.trim()) list = list.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [fileItems, typeFilter, search]);

  const allItems     = [...filteredFolders, ...filteredFiles];
  const allSelected  = allItems.length > 0 && allItems.every((i) => selected.includes(i.name));
  const someSelected = allItems.some((i) => selected.includes(i.name)) && !allSelected;
  const selectedFiles = filteredFiles.filter((f) => selected.includes(f.name));

  // ── Selection ────────────────────────────────────────────────────────────────
  const toggleSelect = (name) => setSelected((p) =>
    p.includes(name) ? p.filter((n) => n !== name) : [...p, name]);

  // ── Move ─────────────────────────────────────────────────────────────────────
  const openMoveDialog = useCallback((items) => {
    setMoveTargets(Array.isArray(items) ? items : [items]);
    setMoveDialogOpen(true);
  }, []);

  const handleMove = useCallback(async (toFolder, files = moveTargets) => {
    try {
      await Promise.all(files.map((f) => moveFile(f.name, f.folder || "", toFolder)));
      showSuccess(
        files.length === 1
          ? `تم نقل "${files[0].name}" إلى ${toFolder}`
          : `تم نقل ${files.length} ملفات إلى ${toFolder}`,
        3000
      );
      setSelected([]);
      setMoveDialogOpen(false);
      setMoveTargets([]);
    } catch { showError("حدث خطأ أثناء النقل"); }
  }, [moveTargets, showSuccess, showError]);

  // ── Drag & Drop ───────────────────────────────────────────────────────────────
  const handleDragStart  = useCallback((file) => setDraggedFile(file), []);
  const handleDragEnd    = useCallback(() => { setDraggedFile(null); setDropTargetFolder(null); }, []);

  const handleFolderDragOver = useCallback((e, folderName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetFolder(folderName);
  }, []);
  const handleFolderDragLeave = useCallback(() => setDropTargetFolder(null), []);

  const handleFolderDrop = useCallback(async (e, folderName) => {
    e.preventDefault();
    setDropTargetFolder(null);
    if (!draggedFile) return;
    // if the dragged file is part of a multi-selection, move all selected files
    const filesToMove = selected.includes(draggedFile.name)
      ? filteredFiles.filter((f) => selected.includes(f.name))
      : [draggedFile];
    await handleMove(folderName, filesToMove);
    setDraggedFile(null);
  }, [draggedFile, selected, filteredFiles, handleMove]);

  // ── Other handlers ───────────────────────────────────────────────────────────
  const handleDownload = (item) => {
    const a = document.createElement("a");
    a.href = getDownloadUrl(item.name);
    a.download = item.name;
    a.click();
  };

  const handleStar = async (item) => {
    try {
      await starFile(item.name, !item.starred);
      showSuccess(item.starred ? "تم إلغاء التمييز" : "تم التمييز", 2000);
    } catch { showError("حدث خطأ"); }
  };

  const handleRename = async (newName) => {
    if (!newName || newName === renameTarget?.name) { setRenameTarget(null); return; }
    try { await renameFile(renameTarget.name, newName); showSuccess("تمت إعادة التسمية", 2000); }
    catch { showError("حدث خطأ"); }
    setRenameTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.isFolder) await deleteFolder(deleteTarget.name);
      else await deleteFile(deleteTarget.name);
      showSuccess("تم الحذف بنجاح", 2000);
      setDeleteTarget(null);
    } catch { showError("حدث خطأ أثناء الحذف"); }
    setDeleting(false);
  };

  const handleUpload = useCallback(async (fileList) => {
    setUploading(true); setUploadProgress(0);
    try {
      await uploadFiles(Array.from(fileList), "", (pct) => setUploadProgress(pct));
      showSuccess("تم الرفع بنجاح", 3000);
      setAddFilesOpen(false);
    } catch (e) { showError(e?.message || "حدث خطأ"); }
    finally { setUploading(false); setUploadProgress(0); }
  }, [showSuccess, showError]);

  const handleCreateFolder = async (name) => {
    try { await createFolder(name); showSuccess(`تم إنشاء المجلد "${name}"`, 2000); setAddFolderOpen(false); }
    catch { showError("حدث خطأ"); }
  };

  // ── Shared cell styles ────────────────────────────────────────────────────────
  const headCell = {
    fontWeight: 600, fontSize: "0.8rem", color: "text.secondary",
    bgcolor: "grey.100", whiteSpace: "nowrap", py: 1.5, px: 2,
  };
  const bodyCell = { py: 1.2, px: 2, borderBottom: "1px solid", borderColor: "divider" };

  // ── GRID VIEW ─────────────────────────────────────────────────────────────────
  const gridView = (
    <Box>
      {/* Folders section */}
      {(typeFilter === "all" || typeFilter === "folder") && (
        <Box mb={4}>
          <SectionHeader title="Folders" count={filteredFolders.length} label="folders"
            open={foldersOpen} onToggle={() => setFoldersOpen((v) => !v)}
            onAdd={() => setAddFolderOpen(true)} />
          <Collapse in={foldersOpen}>
            {isLoading ? <Box textAlign="center" py={4}><CircularProgress /></Box>
            : filteredFolders.length === 0
              ? <Typography color="text.secondary" textAlign="center" py={3}>لا توجد مجلدات</Typography>
              : (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                  {filteredFolders.map((item) => (
                    <Box key={item.name} onDoubleClick={() => handleOpenFolder(item.name)}
                      onClick={() => handleOpenFolder(item.name)}
                      sx={{ cursor: "pointer" }}>
                      <FolderCard item={item}
                        isSelected={selected.includes(item.name)}
                        isDropTarget={dropTargetFolder === item.name}
                        onSelect={toggleSelect} onStar={handleStar}
                        onRename={setRenameTarget} onDelete={setDeleteTarget}
                        onDragOver={(e) => { e.stopPropagation(); handleFolderDragOver(e, item.name); }}
                        onDragLeave={handleFolderDragLeave}
                        onDrop={(e) => handleFolderDrop(e, item.name)} />
                    </Box>
                  ))}
                </Box>
              )}
          </Collapse>
        </Box>
      )}

      {/* Files section */}
      {typeFilter !== "folder" && (
        <Box>
          <SectionHeader title="Files" count={filteredFiles.length} label="files"
            open={filesOpen} onToggle={() => setFilesOpen((v) => !v)}
            onAdd={() => setAddFilesOpen(true)} />
          <Collapse in={filesOpen}>
            {isLoading ? <Box textAlign="center" py={4}><CircularProgress /></Box>
            : filteredFiles.length === 0
              ? <Typography color="text.secondary" textAlign="center" py={3}>لا توجد ملفات</Typography>
              : (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                  {filteredFiles.map((item) => (
                    <FileCard key={item.name} item={item}
                      isSelected={selected.includes(item.name)}
                      isDragging={draggedFile?.name === item.name}
                      onSelect={toggleSelect} onStar={handleStar}
                      onRename={setRenameTarget} onDelete={setDeleteTarget}
                      onDownload={handleDownload}
                      onMove={() => openMoveDialog(item)}
                      onDragStart={() => handleDragStart(item)}
                      onDragEnd={handleDragEnd} />
                  ))}
                </Box>
              )}
          </Collapse>
        </Box>
      )}
    </Box>
  );

  // ── LIST VIEW ─────────────────────────────────────────────────────────────────
  const listView = (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={headCell}>
                <Checkbox size="small" indeterminate={someSelected} checked={allSelected}
                  onChange={() => setSelected(allSelected ? [] : allItems.map((i) => i.name))} />
              </TableCell>
              <TableCell sx={{ ...headCell, textAlign: "right" }}>
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:arrow-up" width={14} />
                  <span>Name</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ ...headCell, textAlign: "center" }}>Size</TableCell>
              <TableCell sx={{ ...headCell, textAlign: "center" }}>Type</TableCell>
              <TableCell sx={{ ...headCell, textAlign: "center" }}>Modified</TableCell>
              <TableCell sx={{ ...headCell, textAlign: "center" }}>Shared</TableCell>
              <TableCell sx={{ ...headCell, width: 80 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}><CircularProgress /></TableCell></TableRow>
            ) : allItems.length === 0 ? (
              <TableRow><TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                <Typography color="text.secondary">لا توجد ملفات</Typography>
              </TableCell></TableRow>
            ) : allItems.map((item) => {
              const ft     = getFileType(item.name, item.isFolder);
              const isSel  = selected.includes(item.name);
              const isDrop = item.isFolder && dropTargetFolder === item.name;
              const isGrab = !item.isFolder && draggedFile?.name === item.name;
              const shared = item.shared || [];
              return (
                <TableRow key={item.name} hover selected={isSel}
                  draggable={!item.isFolder}
                  onDragStart={!item.isFolder ? () => handleDragStart(item) : undefined}
                  onDragEnd={!item.isFolder ? handleDragEnd : undefined}
                  onDragOver={item.isFolder ? (e) => handleFolderDragOver(e, item.name) : undefined}
                  onDragLeave={item.isFolder ? handleFolderDragLeave : undefined}
                  onDrop={item.isFolder ? (e) => handleFolderDrop(e, item.name) : undefined}
                  onDoubleClick={item.isFolder ? () => handleOpenFolder(item.name) : undefined}
                  sx={{
                    transition: "all 0.15s",
                    ...(isDrop && { bgcolor: "#f0fdf4 !important", outline: "2px dashed #22c55e" }),
                    ...(isGrab && { opacity: 0.35 }),
                    cursor: !item.isFolder ? "grab" : "default",
                    "&.Mui-selected": { bgcolor: "action.selected" },
                  }}>

                  <TableCell padding="checkbox" sx={bodyCell}>
                    <Checkbox size="small" checked={isSel} onChange={() => toggleSelect(item.name)} />
                  </TableCell>

                  {/* Name — vertical info */}
                  <TableCell sx={{ ...bodyCell, textAlign: "right" }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="flex-end">
                      {/* Info stack */}
                      <Stack spacing={0.3} alignItems="flex-end">
                        {/* File name */}
                        <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 260 }}>
                          {item.name}
                        </Typography>
                        {/* Folder name (only for files) */}
                        {!item.isFolder && item.folder && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">{item.folder}</Typography>
                            <SvgColor src="/assets/icons/components/ic_default.svg"
                              icon="mdi:folder" width={12} sx={{ color: "#ffa726" }} />
                          </Stack>
                        )}
                        {/* Date */}
                        {!item.isFolder && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="caption" color="text.disabled">
                              {item.modified ? new Date(item.modified).toLocaleDateString("ar-SA",
                                { year: "numeric", month: "short", day: "numeric" }) : "—"}
                            </Typography>
                            <SvgColor src="/assets/icons/components/ic_default.svg"
                              icon="mdi:calendar" width={12} sx={{ color: "text.disabled" }} />
                          </Stack>
                        )}
                        {/* Size */}
                        {!item.isFolder && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="caption" color="text.disabled">
                              {formatSize(item.size)}
                            </Typography>
                            <SvgColor src="/assets/icons/components/ic_default.svg"
                              icon="mdi:harddisk" width={12} sx={{ color: "text.disabled" }} />
                          </Stack>
                        )}
                        {/* Uploaded by */}
                        {!item.isFolder && (item.uploadedBy || item.createdBy || item.username) && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="caption" color="text.disabled" noWrap sx={{ maxWidth: 160 }}>
                              {item.uploadedBy || item.createdBy || item.username}
                            </Typography>
                            <SvgColor src="/assets/icons/components/ic_default.svg"
                              icon="mdi:account" width={12} sx={{ color: "text.disabled" }} />
                          </Stack>
                        )}
                      </Stack>
                      {/* Icon */}
                      <Box sx={{ position: "relative", flexShrink: 0 }}>
                        <FileIcon name={item.name} isFolder={item.isFolder} size={36} />
                        {isDrop && (
                          <Box sx={{ position: "absolute", inset: 0, bgcolor: "success.main", opacity: 0.25,
                            borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="caption" fontWeight={800} color="success.dark">→</Typography>
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ ...bodyCell, textAlign: "center", color: "text.secondary", fontSize: "0.83rem" }}>
                    {formatSize(item.size)}
                  </TableCell>

                  <TableCell sx={{ ...bodyCell, textAlign: "center" }}>
                    <Chip label={item.isFolder ? "folder" : item.type || "file"} size="small"
                      sx={{ fontSize: "0.72rem", height: 22, bgcolor: ft.color + "18", color: ft.color, fontWeight: 600 }} />
                  </TableCell>

                  <TableCell sx={{ ...bodyCell, textAlign: "center", color: "text.secondary", fontSize: "0.8rem" }}>
                    <Typography variant="caption" display="block" fontWeight={500}>
                      {item.modified ? new Date(item.modified).toLocaleDateString("ar-SA",
                        { year: "numeric", month: "long", day: "numeric" }) : "—"}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {item.modified ? new Date(item.modified).toLocaleTimeString("ar-SA",
                        { hour: "2-digit", minute: "2-digit" }) : ""}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ ...bodyCell, textAlign: "center" }}>
                    {shared.length > 0 ? (
                      <AvatarGroup max={3} sx={{ justifyContent: "center",
                        "& .MuiAvatar-root": { width: 28, height: 28, fontSize: "0.7rem" } }}>
                        {shared.map((u, i) => (
                          <Avatar key={i} src={u.avatarUrl} sx={{ bgcolor: "primary.light" }}>{u.name?.[0]}</Avatar>
                        ))}
                      </AvatarGroup>
                    ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>

                  <TableCell sx={{ ...bodyCell, px: 0.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.3}>
                      <IconButton size="small" onClick={() => handleStar(item)}
                        sx={{ color: item.starred ? "#ffc107" : "text.disabled" }}>
                        <SvgColor src="/assets/icons/components/ic_default.svg"
                          icon={item.starred ? "mdi:star" : "mdi:star-outline"} width={18} />
                      </IconButton>
                      <RowMenuList item={item}
                        onDownload={handleDownload} onRename={setRenameTarget}
                        onDelete={setDeleteTarget} onStar={handleStar}
                        onMove={!item.isFolder ? () => openMoveDialog(item) : undefined} />
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={800}>File manager</Typography>
        <Button variant="contained" onClick={() => setAddFilesOpen(true)}
          startIcon={<SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:upload" width={20} />}
          sx={{ bgcolor: "#111", color: "white", borderRadius: 2.5, fontWeight: 700, px: 3, "&:hover": { bgcolor: "#333" } }}>
          Upload
        </Button>
      </Stack>

      {/* Toolbar */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3} flexWrap="wrap" gap={1}>
        <Stack direction="row" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
          <IconButton size="small" onClick={() => setViewMode("grid")}
            sx={{ borderRadius: 0, bgcolor: viewMode === "grid" ? "action.selected" : "transparent" }}>
            <GridIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setViewMode("list")}
            sx={{ borderRadius: 0, bgcolor: viewMode === "list" ? "action.selected" : "transparent" }}>
            <ListIcon />
          </IconButton>
        </Stack>

        <Button variant="outlined" size="small" endIcon={<ChevronDownIcon />}
          onClick={(e) => setTypeMenuAnchor(e.currentTarget)}
          sx={{ borderRadius: 2, textTransform: "none", color: "text.primary", borderColor: "divider" }}>
          {TYPE_FILTERS.find((f) => f.value === typeFilter)?.label || "All type"}
        </Button>
        <Menu anchorEl={typeMenuAnchor} open={Boolean(typeMenuAnchor)}
          onClose={() => setTypeMenuAnchor(null)}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 140 } }}>
          {TYPE_FILTERS.map((f) => (
            <MenuItem key={f.value} selected={typeFilter === f.value}
              onClick={() => { setTypeFilter(f.value); setTypeMenuAnchor(null); }}
              sx={{ fontSize: 14 }}>{f.label}</MenuItem>
          ))}
        </Menu>

        <Button variant="outlined" size="small" endIcon={<ChevronDownIcon />}
          sx={{ borderRadius: 2, textTransform: "none", color: "text.primary", borderColor: "divider" }}>
          Select date
        </Button>

        <Box flex={1} />

        <TextField size="small" placeholder="...Search" value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }} />
      </Stack>

      {/* Content — folder view OR root view */}
      {currentFolder ? (
        <FolderContentsView
          folderName={currentFolder}
          viewMode={viewMode}
          onBack={() => setCurrentFolder(null)}
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
          onStar={handleStar}
          onDownload={handleDownload}
          onMove={(item) => openMoveDialog(item)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          draggedFile={draggedFile}
          dropTargetFolder={dropTargetFolder}
          onFolderDragOver={handleFolderDragOver}
          onFolderDragLeave={handleFolderDragLeave}
          onFolderDrop={handleFolderDrop}
        />
      ) : (
        viewMode === "grid" ? gridView : listView
      )}

      {/* ── Bulk move floating bar (appears when files are selected) ── */}
      {selectedFiles.length > 0 && (
        <Box sx={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 1300 }}>
          <Paper elevation={12} sx={{
            borderRadius: 3, px: 3, py: 1.5,
            display: "flex", alignItems: "center", gap: 2,
            bgcolor: "#111", border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <Typography variant="body2" color="white" fontWeight={600}>
              {selectedFiles.length} ملف محدد
            </Typography>
            <Button size="small" variant="contained" color="success"
              onClick={() => openMoveDialog(selectedFiles)}
              startIcon={<SvgColor src="/assets/icons/components/ic_default.svg"
                icon="mdi:folder-move" width={18} />}
              sx={{ borderRadius: 2, fontWeight: 700 }}>
              نقل إلى مجلد
            </Button>
            <Button size="small" onClick={() => setSelected([])}
              sx={{ color: "grey.400", borderRadius: 2, minWidth: 0 }}>
              ✕
            </Button>
          </Paper>
        </Box>
      )}

      {/* Dialogs */}
      <MoveToDialog
        open={moveDialogOpen}
        files={moveTargets}
        folders={folderItems}
        onClose={() => { setMoveDialogOpen(false); setMoveTargets([]); }}
        onMove={handleMove}
      />
      <AddFilesDialog open={addFilesOpen} onClose={() => !uploading && setAddFilesOpen(false)}
        onUpload={handleUpload} uploading={uploading} progress={uploadProgress} />
      <AddFolderDialog open={addFolderOpen} onClose={() => setAddFolderOpen(false)}
        onCreate={handleCreateFolder} />
      <RenameDialog open={Boolean(renameTarget)} item={renameTarget}
        onClose={() => setRenameTarget(null)} onSave={handleRename} />
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: "error.main", color: "white", py: 2 }}>تأكيد الحذف</DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <Typography>هل تريد حذف <strong>{deleteTarget?.name}</strong> بشكل نهائي؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>إلغاء</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> :
              <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />}>
            {deleting ? "جاري الحذف..." : "حذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
