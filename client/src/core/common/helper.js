import { objectToFormData } from "object-to-formdata";

const options = {
  indices: true,
  nulls: false
};

export function buildFormData(object, currentFormData, prefix) {
  return objectToFormData(
    object,
    options, // optional
    currentFormData, // optional
    prefix // optional
  );
}
