import type { ComponentProps } from "react";

import {
  TextAreaField as SharedTextAreaField,
  TextField as SharedTextField,
} from "@/components/shared/form-field";

import { fieldId, type CheckoutField } from "../checkout-form";

// Checkout fields use fixed ids (fieldId) so the error summary can link to them.

export function TextField(
  props: Omit<ComponentProps<typeof SharedTextField>, "id" | "name"> & { name: CheckoutField },
) {
  return <SharedTextField {...props} id={fieldId(props.name)} />;
}

export function TextAreaField(
  props: Omit<ComponentProps<typeof SharedTextAreaField>, "id" | "name"> & { name: CheckoutField },
) {
  return <SharedTextAreaField {...props} id={fieldId(props.name)} />;
}
