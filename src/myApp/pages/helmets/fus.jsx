import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { useState, Fragment } from "react";
import { useSettingsContext } from "src/components/settings";

// حالات التشغيل
const STATUS = ["IN SERVICE", "SHUTDOWN"];

// بناء قائمة FUS الأساسية
const SINGLE_FUS = Array.from({ length: 8 }, (_, i) => `FUS#${i + 1}`);
// FUS #9 و #10
const PARENT_FUS = ["FUS#9", "FUS#10"];
const INITIAL_FUS = [
  ...SINGLE_FUS.map((id) => ({ id, isParent: false, status: "IN SERVICE" })),
  ...PARENT_FUS.map((id) => ({
    id,
    isParent: true,
    children: [
      { id: `${id}-A`, status: "IN SERVICE" },
      { id: `${id}-B`, status: "IN SERVICE" },
    ],
  })),
];

export default function FusView() {
  const settings = useSettingsContext();
  const [fus, setFus] = useState(INITIAL_FUS);

  // تحديث حالة FUS مفرد أو Sub‑FUS
  const updateStatus = (fusId, childId, newStatus) => {
    setFus((prev) =>
      prev.map((f) => {
        // حالة FUS الأبوي
        if (f.id === fusId && !childId && !f.isParent) {
          return { ...f, status: newStatus };
        }
        // حالة FUS الابن
        if (f.id === fusId && childId && f.isParent) {
          return {
            ...f,
            children: f.children.map((c) =>
              c.id === childId ? { ...c, status: newStatus } : c,
            ),
          };
        }
        return f;
      }),
    );
  };

  // تحكم في إظهار Sub‑FUS عند اختيار FUS #9 أو #10
  const [expandedParents, setExpandedParents] = useState([]);

  const toggleExpand = (parentId) => {
    setExpandedParents((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId],
    );
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 140 }}>FUS</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fus.map((f) => (
                    <Fragment key={f.id}>
                      {/* الصف الرئيسي */}
                      <TableRow>
                        <TableCell
                          sx={{
                            cursor: f.isParent ? "pointer" : "default",
                            fontWeight: f.isParent ? "600" : "400",
                          }}
                          onClick={() => f.isParent && toggleExpand(f.id)}
                        >
                          {f.id}
                          {f.isParent &&
                            (expandedParents.includes(f.id) ? " ▼" : " ▶")}
                        </TableCell>

                        <TableCell>
                          {f.isParent ? (
                            // اختيار متعدد للأب: A و/أو B أو كليهما
                            <FormControl
                              component="fieldset"
                              variant="standard"
                            >
                              <FormGroup row>
                                {f.children.map((c) => (
                                  <FormControlLabel
                                    key={c.id}
                                    control={
                                      <Checkbox
                                        checked={expandedParents.includes(f.id)}
                                        disabled
                                      />
                                    }
                                    label={c.id.split("-")[1]} // A أو B
                                  />
                                ))}
                              </FormGroup>
                            </FormControl>
                          ) : (
                            // FUS مفرد
                            <Select
                              size="small"
                              value={f.status}
                              onChange={(e) =>
                                updateStatus(f.id, null, e.target.value)
                              }
                            >
                              {STATUS.map((s) => (
                                <MenuItem key={s} value={s}>
                                  {s}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* الصفوف الفرعية (A/B) */}
                      {f.isParent &&
                        expandedParents.includes(f.id) &&
                        f.children.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell sx={{ pl: 4 }}>{c.id}</TableCell>
                            <TableCell>
                              <Select
                                size="small"
                                value={c.status}
                                onChange={(e) =>
                                  updateStatus(f.id, c.id, e.target.value)
                                }
                              >
                                {STATUS.map((s) => (
                                  <MenuItem key={s} value={s}>
                                    {s}
                                  </MenuItem>
                                ))}
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
