import * as Yup from "yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";
import { useRouter, useSearchParams } from "src/routes/hooks";

import { useBoolean } from "src/shared/hooks/use-boolean";

import { useAuthContext } from "src/auth/hooks";
import { PATH_AFTER_LOGIN } from "src/config-global";

import SvgColor from "src/components/svg-color";

import FormProvider, { RHFTextField } from "src/components/hook-form";
import { Divider } from "@mui/material";

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();

  const returnTo = searchParams.get("returnTo");

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    user_name: Yup.string().required("Email is required"),
    // .user_name("Your Badge Number is"),
    password: Yup.string().required("Password is required"),
  });

  const defaultValues = {
    user_name: "86718",
    password: "admin",
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.user_name, data.password);

      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === "string" ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography textAlign="center" variant="h5">
        بوابة قسم التشغيل
      </Typography>

      {/* <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New user?</Typography>

        <Link
          component={RouterLink}
          href={paths.auth.jwt.register}
          variant="subtitle2"
        >
          Create an account
        </Link>
      </Stack> */}
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField name="user_name" label="الرقم الوظيفي" />

      <RHFTextField
        name="password"
        label="كلمة السر"
        type={password.value ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <SvgColor
                  src="/assets/icons/components/ic_default.svg"
                  icon={
                    password.value ? "solar:eye-bold" : "solar:eye-closed-bold"
                  }
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* <Link
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: "flex-end" }}
      >
        Forgot password?
      </Link> */}

      <LoadingButton
        fullWidth
        fontWeight={400}
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        تسجيل الدخول
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong> رقمك الوظيفي و</strong>
        {/* <Divider /> */}
        <strong> كلمة السر</strong>
      </Alert>

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
