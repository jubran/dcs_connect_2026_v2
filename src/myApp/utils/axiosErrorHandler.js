export const parseAxiosError = (error) => {
  if (!error.response) {
    return {
      type: "NETWORK",
      message: "لا يوجد اتصال بالخادم",
    };
  }

  const { status, data } = error.response;

  // 🔥 لو السيرفر رجّع نص
  if (typeof data === "string") {
    return {
      type: status === 422 ? "VALIDATION" : "SERVER",
      message: data,
    };
  }

  if (status === 422) {
    return {
      type: "VALIDATION",
      message: data?.message || "البيانات المدخلة غير صالحة",
      errors: data?.errors || null,
    };
  }

  return {
    type: "UNKNOWN",
    message: "حدث خطأ غير متوقع",
  };
};
