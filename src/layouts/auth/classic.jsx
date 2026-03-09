import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme, keyframes } from "@mui/material/styles";

import { useResponsive } from "src/myApp/hooks/use-responsive";

import { bgGradient } from "src/theme/css";

import Logo from "src/components/logo";
import { display } from "@mui/system";
import { useEffect, useState } from "react";

const fade = keyframes`
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.9; }
`;

// إنشاء شبكة مربعات عشوائية

export function AnimatedSquares({ rows = 6, cols = 10, size = 150, gap = 10 }) {
  const [opacities, setOpacities] = useState(
    Array.from({ length: rows * cols }, () => Math.random()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacities(
        (prev) => prev.map(() => Math.random()), // تغيير opacity عشوائي
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap", // مهم
        gap: `${gap}px`,
        width: "100%",
        overflowX: "auto", // إذا العدد كبير يضيف scroll
        py: 2,
      }}
    >
      {opacities.map((opacity, idx) => (
        <Box
          key={idx}
          sx={{
            width: size,
            height: size,
            bgcolor: "common.white",
            opacity,
            borderRadius: 1,
            transition: "opacity 0.5s ease-in-out",
            flexShrink: 0, // يمنع التصغير
          }}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function AuthClassicLayout({ children, image, title }) {
  const theme = useTheme();

  const mdUp = useResponsive("up", "md");

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: "absolute",
        m: { xs: 2, md: 5 },
      }}
    />
  );

  const renderContent = (
    <Stack
      sx={{
        direction: "ltr",
        width: 1,
        mx: "auto",
        maxWidth: 480,
        px: { xs: 2, md: 8 },
        pt: { xs: 15, md: 20 },
        pb: { xs: 15, md: 0 },
      }}
    >
      {children}
    </Stack>
  );

  const renderSection = (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100%",
        ...bgGradient({
          color: alpha(
            theme.palette.background.default,
            theme.palette.mode === "light" ? 0.88 : 0.94,
          ),
          imgUrl: "/assets/background/overlay_2.jpg",
        }),
        overflow: "hidden",
        py: 8,
      }}
    >
      {/* شبكة المربعات كخلفية */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0, // تحت العنوان والمحتوى
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AnimatedSquares rows={8} cols={10} size={150} gap={10} />
      </Box>

      {/* المحتوى فوق المربعات */}
      {/* <Box sx={{ zIndex: 1, position: "relative", textAlign: "center" }}>
    <Typography
      variant="h3"
      sx={{ maxWidth: 480, mx: "auto" }}
    >
      {title || "بوابة قسم التشغيل الإلكترونية"}
    </Typography>
  </Box> */}
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: "100vh",
        direction: "rtl",
      }}
    >
      {renderLogo}

      {mdUp && renderSection}

      {renderContent}
    </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string,
};
