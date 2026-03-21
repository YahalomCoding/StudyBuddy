import { forwardRef, type ReactNode } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type FormControlProps,
  type SelectProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface RtlSelectOption {
  label: ReactNode;
  value: string;
}

export interface RtlSelectProps extends Omit<
  SelectProps<string>,
  "children" | "label"
> {
  id: string;
  label: string;
  options: RtlSelectOption[];
  placeholder?: ReactNode;
  formControlProps?: FormControlProps;
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  direction: "rtl",
  "& .MuiInputLabel-root": {
    right: theme.spacing(3),
    left: "auto",
    transformOrigin: "top right",
  },
  "& .MuiOutlinedInput-root": {
    direction: "rtl",
    textAlign: "right",
  },
  "& .MuiSelect-select": {
    textAlign: "right",
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(5),
  },
  "& .MuiSelect-icon": {
    left: theme.spacing(1.5),
    right: "auto",
  },
  "& .MuiOutlinedInput-notchedOutline legend": {
    textAlign: "right",
  },
}));

export const RtlSelect = forwardRef<HTMLInputElement, RtlSelectProps>(
  function RtlSelect(
    {
      id,
      label,
      options,
      placeholder,
      formControlProps,
      displayEmpty = Boolean(placeholder),
      renderValue,
      value,
      ...selectProps
    },
    ref
  ) {
    const labelId = `${id}-label`;

    return (
      <StyledFormControl fullWidth {...formControlProps}>
        <InputLabel id={labelId} shrink>
          {label}
        </InputLabel>
        <Select
          {...selectProps}
          id={id}
          labelId={labelId}
          label={label}
          inputRef={ref}
          value={value ?? ""}
          displayEmpty={displayEmpty}
          renderValue={
            renderValue ??
            ((selected) => {
              if ((selected === "" || selected == null) && placeholder) {
                return <span style={{ opacity: 0.7 }}>{placeholder}</span>;
              }

              return (
                options.find((option) => option.value === selected)?.label ?? ""
              );
            })
          }
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </StyledFormControl>
    );
  }
);
