export const formatStepText = (
  text,
  variableName,
  selections,
  defaultValue,
) => {
  if (!text.includes(`{${variableName}}`)) return text;

  const value = selections[variableName] || defaultValue || "____";
  return text.replace(`{${variableName}}`, value);
};
