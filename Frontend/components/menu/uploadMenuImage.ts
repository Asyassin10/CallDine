export async function uploadMenuImage(file: FormDataEntryValue | null, current = "") {
  if (!(file instanceof File) || !file.size) return current;
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/menu/image", { method: "POST", body });
  if (!response.ok) throw new Error("Image upload failed");
  return (await response.json() as { image_url: string }).image_url;
}
