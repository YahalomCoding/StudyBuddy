import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type FormControlProps,
  type SelectProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { forwardRef, type ReactNode } from "react";

interface RtlSelectOption {
  label: ReactNode;
  value: string;
}

export interface RtlSelectProps extends Omit<
  SelectProps,
  "children" | "label"
> {
  id: string;
  label: string;
  options: RtlSelectOption[];
  placeholder?: ReactNode;
  formControlProps?: FormControlProps;
  helperText?: ReactNode;
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
      helperText,
      displayEmpty = Boolean(placeholder),
      multiple,
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
          multiple={multiple}
          inputRef={ref}
          value={value ?? ""}
          displayEmpty={displayEmpty}
          renderValue={
            renderValue ??
            ((selected) => {
              if (
                (selected === "" ||
                  selected == null ||
                  (Array.isArray(selected) && selected.length === 0)) &&
                placeholder
              ) {
                return <span style={{ opacity: 0.7 }}>{placeholder}</span>;
              }

              if (multiple && Array.isArray(selected)) {
                return selected
                  .map(
                    (selectedValue) =>
                      options.find((option) => option.value === selectedValue)
                        ?.label ?? selectedValue
                  )
                  .join(", ");
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
        {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
      </StyledFormControl>
    );
  }
);
