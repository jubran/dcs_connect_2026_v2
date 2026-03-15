import { useState } from "react";
import {
  Avatar, Box, Card, CardContent, Chip, Divider,
  IconButton, Stack, Tab, Tabs, Typography, TextField,
  Button, AvatarGroup,
} from "@mui/material";
import SvgColor from "src/components/svg-color";
import { useAuthContext } from "src/auth/hooks";

// ─── Inline icons ─────────────────────────────────────────────────────────────
const MoreIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18 16c-.8 0-1.5.3-2.1.8L8.9 12.7c.1-.2.1-.5.1-.7s0-.5-.1-.7l7-4c.6.5 1.3.8 2.1.8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .2 0 .5.1.7l-7 4C7.5 9.3 6.8 9 6 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2.1-.8l7.1 4.1c-.1.2-.1.4-.1.7 0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9S19.6 16 18 16z"/>
  </svg>
);
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "#e91e63" : "none"}
    stroke={filled ? "none" : "currentColor"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_POSTS = [
  {
    id: 1,
    content: "تشرق الشمس ببطء على الأفق، لتلوّن السماء بألوان البرتقالي والوردي الزاهيين.",
    image: null,
    date: "15 مارس 2026",
    likes: 17,
    liked: false,
    comments: [
      { user: "لين ديفيدسون", avatar: "ل", time: "13 مارس 2026", text: "ما أجمل هذا الوصف!" },
      { user: "سالم الغامدي",  avatar: "س", time: "13 مارس 2026", text: "رائع جداً" },
    ],
    reactors: ["م","خ","س","ع","ف"],
  },
  {
    id: 2,
    content: "تم الانتهاء من صيانة وحدة التقطير بنجاح. شكراً لفريق التشغيل على الجهود المبذولة.",
    image: null,
    date: "12 مارس 2026",
    likes: 9,
    liked: true,
    comments: [],
    reactors: ["م","ع"],
  },
];

const SOCIAL_LINKS = [
  { icon: "mdi:facebook",  label: "Facebook",  url: "https://www.facebook.com/frankie",  color: "#1877f2" },
  { icon: "mdi:instagram", label: "Instagram", url: "https://www.instagram.com/frankie", color: "#e1306c" },
  { icon: "mdi:linkedin",  label: "LinkedIn",  url: "https://www.linkedin.com/in/frankie", color: "#0a66c2" },
  { icon: "mdi:twitter",   label: "Twitter",   url: "https://www.twitter.com/frankie",   color: "#1da1f2" },
];

const ABOUT_ROWS = [
  { icon: "mdi:map-marker", text: "يقيم في ", bold: "المملكة العربية السعودية" },
  { icon: "mdi:email",      text: "البريد: ",  bold: "user@dcs.com" },
  { icon: "mdi:briefcase",  text: "يعمل في ",  bold: "شركة DCS" },
  { icon: "mdi:school",     text: "درس في ",   bold: "جامعة الملك عبدالله" },
];

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post, user }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Post header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <IconButton size="small"><MoreIcon /></IconButton>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box textAlign="right">
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.u_fullname || user?.u_username || "المستخدم"}
              </Typography>
              <Typography variant="caption" color="text.secondary">{post.date}</Typography>
            </Box>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", fontWeight: 700 }}>
              {(user?.u_fullname || user?.u_username || "م")[0]}
            </Avatar>
          </Stack>
        </Stack>

        {/* Content */}
        <Typography variant="body2" color="text.primary" textAlign="right" mb={post.image ? 1.5 : 0}>
          {post.content}
        </Typography>

        {/* Image */}
        {post.image && (
          <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 1.5 }}>
            <Box component="img" src={post.image} sx={{ width: "100%", display: "block" }} />
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Actions */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Reactors */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {post.reactors.length > 0 && (
              <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: "0.65rem" } }}>
                {post.reactors.map((r, i) => (
                  <Avatar key={i} sx={{ bgcolor: ["#1976d2","#388e3c","#f57c00","#7b1fa2","#d32f2f"][i % 5] }}>
                    {r}
                  </Avatar>
                ))}
              </AvatarGroup>
            )}
            <Typography variant="caption" color="text.secondary">{likes}+</Typography>
          </Stack>

          {/* Buttons */}
          <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <ShareIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <CommentIcon />
            </IconButton>
            <IconButton size="small"
              onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
              sx={{ color: liked ? "#e91e63" : "text.secondary" }}>
              <HeartIcon filled={liked} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Comments */}
        {post.comments.length > 0 && (
          <Stack spacing={1} mt={1.5}>
            {post.comments.map((c, i) => (
              <Stack key={i} direction="row" alignItems="flex-start" spacing={1.5}
                sx={{ bgcolor: "grey.50", borderRadius: 2, p: 1.2 }}>
                <Box flex={1} textAlign="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={1} mb={0.3}>
                    <Typography variant="caption" color="text.secondary">{c.time}</Typography>
                    <Typography variant="caption" fontWeight={700}>{c.user}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{c.text}</Typography>
                </Box>
                <Avatar sx={{ width: 30, height: 30, fontSize: "0.7rem", bgcolor: "primary.light" }}>
                  {c.avatar}
                </Avatar>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyProfilePage() {
  const { user } = useAuthContext();
  const [tab, setTab] = useState("profile");
  const [postText, setPostText] = useState("");

  const displayName = user?.u_fullname || user?.u_username || "المستخدم";
  const role        = user?.u_role || "مستخدم";
  const initial     = displayName[0] || "م";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" ,direction: "rtl" }}>

      {/* ── Cover + Avatar ── */}
      <Box sx={{
        background: "linear-gradient(135deg, #0d3d2f 0%, #1a6b56 40%, #0e4a3a 70%, #0a2e22 100%)",
        height: 220, position: "relative", borderRadius: { md: "0 0 16px 16px" },
        display: "flex", alignItems: "flex-end", px: 4, pb: 3,
      }}>
        {/* Decorative circles */}
        {[...Array(6)].map((_, i) => (
          <Box key={i} sx={{
            position: "absolute",
            width: [120,80,60,140,90,50][i], height: [120,80,60,140,90,50][i],
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
            top:  ["20%","60%","10%","40%","70%","30%"][i],
            left: ["10%","25%","60%","75%","45%","85%"][i],
          }} />
        ))}
        <Stack direction="row" alignItems="flex-end" spacing={3} sx={{ zIndex: 1 }}>
          <Avatar sx={{
            width: 88, height: 88, fontSize: "2rem", fontWeight: 800,
            bgcolor: "primary.light", border: "4px solid white",
            mb: -1,
          }}>
            {initial}
          </Avatar>
          <Box mb={1}>
            <Typography variant="h5" fontWeight={800} color="white">{displayName}</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>{role}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "#111" } }}>
          {[
            { value: "gallery",   label: "المعرض",     icon: "mdi:image-multiple" },
            { value: "friends",   label: "الأصدقاء",   icon: "mdi:account-multiple" },
            { value: "followers", label: "المتابعون",  icon: "mdi:heart" },
            { value: "profile",   label: "الملف الشخصي", icon: "mdi:badge-account" },
          ].map((t) => (
            <Tab key={t.value} value={t.value}
              label={
                <Stack direction="row" alignItems="center" spacing={0.7}>
                  <SvgColor src="/assets/icons/components/ic_default.svg"
                    icon={t.icon} width={18} />
                  <span>{t.label}</span>
                </Stack>
              }
              sx={{ fontWeight: 600, fontSize: "0.85rem", minHeight: 52 }} />
          ))}
        </Tabs>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
        {tab === "profile" && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">

            {/* ── Left: Feed ── */}
            <Box flex={1}>
              {/* Post composer */}
              <Card variant="outlined" sx={{ borderRadius: 3, mb: 2.5 }}>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2 } }}>
                  <TextField
                    fullWidth multiline rows={2} placeholder="...شارك ما تفكر فيه"
                    value={postText} onChange={(e) => setPostText(e.target.value)}
                    variant="standard" InputProps={{ disableUnderline: true }}
                    sx={{ mb: 2, textAlign: "right",
                      "& textarea": { textAlign: "right", fontSize: "0.9rem" } }}
                  />
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1}>
                      {[
                        { label: "صورة/فيديو", icon: "mdi:image", color: "#43a047" },
                        { label: "بث مباشر",   icon: "mdi:video",  color: "#e53935" },
                      ].map((btn) => (
                        <Button key={btn.label} size="small" variant="outlined"
                          startIcon={<SvgColor src="/assets/icons/components/ic_default.svg"
                            icon={btn.icon} width={16} sx={{ color: btn.color }} />}
                          sx={{ borderRadius: 2, fontSize: "0.75rem", textTransform: "none",
                            borderColor: "divider", color: "text.secondary" }}>
                          {btn.label}
                        </Button>
                      ))}
                    </Stack>
                    <Button variant="contained"
                      sx={{ bgcolor: "#111", color: "white", borderRadius: 2,
                        fontWeight: 700, "&:hover": { bgcolor: "#333" } }}>
                      نشر
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Posts */}
              <Stack spacing={2.5}>
                {MOCK_POSTS.map((post) => (
                  <PostCard key={post.id} post={post} user={user} />
                ))}
              </Stack>
            </Box>

            {/* ── Right: Sidebar ── */}
            <Box sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}>
              <Stack spacing={2.5}>

                {/* Stats */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
                      {[
                        { label: "يتابع",    value: "٩٬١٢٤" },
                        { label: "متابِع",   value: "١٬٩٤٧" },
                      ].map((s) => (
                        <Box key={s.label} flex={1} textAlign="center" py={0.5}>
                          <Typography variant="h6" fontWeight={800}>{s.value}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* About */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} textAlign="right" mb={1.5}>
                      عني
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="right" mb={2}>
                      مهندس متخصص في أنظمة التحكم الرقمي. شغوف بالتقنية والأتمتة الصناعية.
                    </Typography>
                    <Stack spacing={1.2}>
                      {ABOUT_ROWS.map((row, i) => (
                        <Stack key={i} direction="row" alignItems="center"
                          justifyContent="flex-end" spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            {row.text}<strong>{row.bold}</strong>
                          </Typography>
                          <SvgColor src="/assets/icons/components/ic_default.svg"
                            icon={row.icon} width={18} sx={{ color: "text.disabled", flexShrink: 0 }} />
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Social */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} textAlign="right" mb={1.5}>
                      التواصل الاجتماعي
                    </Typography>
                    <Stack spacing={1.2}>
                      {SOCIAL_LINKS.map((s) => (
                        <Stack key={s.label} direction="row" alignItems="center"
                          justifyContent="flex-end" spacing={1}>
                          <Typography variant="body2" color="text.secondary" noWrap
                            sx={{ maxWidth: 200, fontSize: "0.78rem" }}>
                            {s.url}
                          </Typography>
                          <Box sx={{
                            width: 28, height: 28, borderRadius: 1, flexShrink: 0,
                            bgcolor: s.color + "18", display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}>
                            <SvgColor src="/assets/icons/components/ic_default.svg"
                              icon={s.icon} width={16} sx={{ color: s.color }} />
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

              </Stack>
            </Box>
          </Stack>
        )}

        {tab !== "profile" && (
          <Box textAlign="center" py={8}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon="mdi:construction" width={56} sx={{ color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">قريباً</Typography>
            <Typography variant="body2" color="text.disabled">هذا القسم قيد التطوير</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
