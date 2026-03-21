import { forwardRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)(({ theme }) => ({
  direction: "rtl",
  "& .MuiInputLabel-root": {
    right: theme.spacing(3),
    left: "auto",
    transformOrigin: "top right",
  },
  "& .MuiInputBase-input": {
    direction: "rtl",
    textAlign: "right",
  },
  "& .MuiOutlinedInput-notchedOutline legend": {
    textAlign: "right",
  },
}));

export const RtlTextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function RtlTextField(props, ref) {
    return (
      <StyledTextField
        {...props}
        inputRef={ref}
        slotProps={{
          ...props.slotProps,
          inputLabel: {
            ...props.slotProps?.inputLabel,
            shrink: true,
          },
        }}
      />
    );
  }
);
