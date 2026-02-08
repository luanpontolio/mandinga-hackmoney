export const slugifyEnsLabel = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const withoutDiacritics = trimmed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const cleaned = withoutDiacritics.replace(/[^a-z0-9\s-]/g, "");
  const withDashes = cleaned.replace(/\s+/g, "-").replace(/-+/g, "-");
  return withDashes.replace(/^-|-$/g, "");
};

export const buildEnsName = (label: string, domain: string) => {
  const slug = slugifyEnsLabel(label);
  if (!slug) return domain;
  return `${slug}.${domain}`;
};
