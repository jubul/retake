/** FormData → objeto plano (último valor gana). Los File se dejan como File. */
export function formDataToObject(fd: FormData): Record<string, FormDataEntryValue> {
  const out: Record<string, FormDataEntryValue> = {};
  for (const [k, v] of fd.entries()) out[k] = v;
  return out;
}
