export function createSlug(text: string): string {
  // Remove special characters using regex
  const cleanedText = text.replace(/[^\w\s]/gi, '');
  // Replace spaces with hyphens and convert to lowercase
  return cleanedText.toLowerCase().replace(/\s+/g, '-');
}
