/**
 * Calculates the age of a book based on its publication date.
 * @param pubDate - The publication date string (e.g., "YYYY-MM-DD").
 * @returns A formatted string representing the age.
 */
export const calculateAge = (pubDate: string): string => {
  const publication = new Date(pubDate);
  const today = new Date();

  let years = today.getFullYear() - publication.getFullYear();
  let months = today.getMonth() - publication.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < publication.getDate())) {
    years--;
    months = (months + 12) % 12;
  }
  
  return `${years} years, ${months} months`;
};

/**
 * Categorizes a book based on its genre.
 * This function replicates the logic from the original GenreStrategy.
 * @param genre - The genre of the book.
 * @returns The category name as a string.
 */
export const categorizeGenre = (genre: string): string => {
  switch (genre.toLowerCase()) {
    case "fiction": return "Entertainment";
    case "science": return "Educational";
    case "history": return "Informational";
    case "biography": return "Inspirational";
    case "technology": return "Technical";
    case "romance": return "Emotional";
    default: return "General";
  }
};