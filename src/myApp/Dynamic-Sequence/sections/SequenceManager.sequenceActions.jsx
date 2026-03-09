import { memo } from "react";
import { Box, Button } from "@mui/material";
import SvgColor from "src/components/svg-color";

const SequenceActions = memo(
  ({ hasTasks, hasChanges, onReview, onReset, userAuth }) => {
    // تحديد نص الزر
    const reviewText =
      userAuth === "admin"
        ? hasChanges
          ? "المتابعة لإضافة ملاحظة وحفظ الترتيب"
          : "المتابعة لإضافة ملاحظة"
        : "فقط يمكنك الإطلاع على اولويات التشغيل";

    // الزر يكون فعال فقط إذا admin وhasTasks
    const isReviewDisabled = userAuth !== "admin" || !hasTasks;

    return (
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          fullWidth
          color={userAuth === "admin" ? "info" : "error"}
          variant={hasChanges ? "contained" : "outlined"}
          disabled={isReviewDisabled}
          onClick={onReview}
          endIcon={
            <SvgColor
              src="/assets/icons/dcs/check.svg"
              icon={
                userAuth === "admin"
                  ? hasChanges
                    ? "mdi:arrow-left"
                    : "mdi:pen"
                  : "mdi:eye-outline"
              }
            />
          }
          sx={{
            fontWeight: 100,
          }}
        >
          {reviewText}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          disabled={!hasChanges}
          onClick={onReset}
          startIcon={
            <SvgColor
              src="/assets/icons/dcs/square-bold.svg"
              icon={hasChanges ? "mdi:refresh" : "mdi:check"}
            />
          }
        >
          {hasChanges ? "إعادة التعيين" : "لا يوجد تغييرات"}
        </Button>
      </Box>
    );
  },
);

export default SequenceActions;
