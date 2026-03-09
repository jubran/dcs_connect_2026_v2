import { alpha } from "@mui/material/styles";
import {
  Container,
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Card,
  CardContent,
} from "@mui/material";

import { useSettingsContext } from "src/components/settings";
import { useState } from "react";

// 1) تعريف الحالات الممكنة بدون SETTLING
const TankStatus = Object.freeze({
  SERVICE: "SERVICE",
  FILLING: "FILLING",
  FEEDING: "FEEDING",
  RETURN: "RETURN",
  MAINTENANCE: "MAINTENANCE",
});

// 2) بيانات مبدئية: status كمصفوفة فارغة تعني “Settling”
const initialTanks = [
  { id: "diesel-1", name: "Diesel Tank 1", status: [] },
  { id: "diesel-2", name: "Diesel Tank 2", status: [] },
  { id: "crude-1", name: "Crude Tank 1", status: [] },
  { id: "crude-2", name: "Crude Tank 2", status: [] },
];

export default function FuelTanksView() {
  const settings = useSettingsContext();
  const [tanks, setTanks] = useState(initialTanks);

  // 3) دالة لتغيير الحالات مع فلترة القيم الصحيحة
  const handleChangeStatus = (tankId, newStatusArray) => {
    const filtered = Array.isArray(newStatusArray)
      ? newStatusArray.filter((v) => typeof v === "string" && v)
      : [];
    setTanks((prev) =>
      prev.map((t) => (t.id === tankId ? { ...t, status: filtered } : t)),
    );
  };

  // مساعد لتحويل النص: capitalize وحماية من undefined
  const capitalize = (str) =>
    typeof str === "string" && str.length > 0
      ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      : "";

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom></Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1">
            اختر/غيّر الحالات لكل خزان. إذا لم تختَر شيئًا، سيظهر “Settling”.
          </Typography>
        </CardContent>
      </Card>

      <Box
        sx={{
          width: "100%",
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          p: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الخزان</TableCell>
              <TableCell>الحالات الحالية</TableCell>
              <TableCell>تغيير الحالات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tanks.map((tank) => {
              const validStatuses = tank.status.filter(
                (s) => typeof s === "string",
              );
              const displayStatus =
                validStatuses.length > 0
                  ? validStatuses.map(capitalize).join(" + ")
                  : "Settling";

              return (
                <TableRow key={tank.id}>
                  <TableCell>{tank.name}</TableCell>
                  <TableCell>{displayStatus}</TableCell>
                  <TableCell>
                    <Select
                      multiple
                      value={validStatuses}
                      onChange={(e) =>
                        handleChangeStatus(tank.id, e.target.value)
                      }
                      renderValue={(selected) =>
                        Array.isArray(selected) && selected.length > 0
                          ? selected.map(capitalize).join(" + ")
                          : "Settling"
                      }
                      size="small"
                    >
                      {Object.values(TankStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          <Checkbox checked={validStatuses.includes(status)} />
                          <ListItemText primary={capitalize(status)} />
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
