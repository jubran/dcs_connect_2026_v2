// shared/useFormSubmit.js
// Moved from: engine/useFormSubmit.js
// Shared submit hook — used by all 5 form modules.
// Date/time sanitisation is handled here so individual forms
// can store either Date objects (Tank) or formatted strings (others).

import { useState, useCallback } from "react";
import dayjs from "dayjs";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import { useAuthUser } from "src/auth/context/jwt/utils";
import { parseAxiosError } from "src/shared/utils/axiosErrorHandler";
import operationService from "./operationService";

// ── Formatters ────────────────────────────────────────────────────────────────

const formatDateForApi = (val) => {
  if (!val) return "";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = dayjs(val);
  return d.isValid() ? d.format("YYYY-MM-DD") : "";
};

const formatTimeForApi = (val) => {
  if (!val) return "";
  if (typeof val === "string" && /^\d{2}:\d{2}$/.test(val)) return val;
  const t = dayjs(val);
  return t.isValid() ? t.format("HH:mm") : "";
};

// ─────────────────────────────────────────────────────────────────────────────

export const useFormSubmit = ({
  formData,
  entityType,
  selectedOperation,
  mode = "new",
  data,
  validateForm,
  onSave,
  onError,
}) => {
  const isEditMode = mode === "edit";
  const [loading, setLoading] = useState(false);
  const { fullName } = useAuthUser();
  const { showError } = useSnackbar();

  const submit = useCallback(async () => {
    // Client-side validation
    if (validateForm && !validateForm()) {
      const msg = "يرجى ملء جميع الحقول المطلوبة";
      onError?.(msg);
      return;
    }

    setLoading(true);

    try {
      const eventDate = formatDateForApi(formData.eventDate);
      const eventTime = formatTimeForApi(formData.eventTime);

      const payload = {
        ...formData,
        eventDate,
        eventTime,
        username: fullName,
        mode,
        id: isEditMode ? data?.id : undefined,
        entityType,
      };

      const result = await operationService.createOperation({
        entityType,
        payload,
        isEditMode,
      });

      if (result?.success) {
        onSave?.(result);
      } else {
        const msg = result?.message || "حدث خطأ أثناء الحفظ";
        onError?.(msg);
        showError?.(msg);
      }
    } catch (error) {
      console.error("[useFormSubmit] error:", error);
      const parsed = parseAxiosError(error);
      if (parsed.type === "VALIDATION" && parsed.errors) {
        const messages = Object.values(parsed.errors).join("، ");
        onError?.(messages);
        showError?.(messages);
      } else {
        onError?.(parsed.message);
        showError?.(parsed.message);
      }
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    entityType,
    selectedOperation,
    fullName,
    mode,
    isEditMode,
    data,
    onSave,
    onError,
    validateForm,
  ]);

  return { submit, loading };
};

export default useFormSubmit;
