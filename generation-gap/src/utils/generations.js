export const generations = [
  {
    name: "Generation Alpha",
    period: "2010s - mid-2020s",
    translate: (text) => {
      // Add emojis and modern tech references
      return text
        .replace(/good/gi, "epic")
        .replace(/great/gi, "fire 🔥")
        .replace(/friend/gi, "bestie")
        + " no cap fr fr";
    }
  },
  {
    name: "Generation Z",
    period: "1997 - 2009",
    translate: (text) => {
      // Add Gen Z slang and internet speak
      return text
        .replace(/hello/gi, "hey bestie")
        .replace(/cool/gi, "bussin")
        .replace(/amazing/gi, "slaps")
        + " fr";
    }
  },
  {
    name: "Millennials",
    period: "1981 - 1996",
    translate: (text) => {
      // Add millennial phrases and references
      return text
        .replace(/good/gi, "literally so good")
        .replace(/bad/gi, "can't even")
        + " #blessed";
    }
  },
  {
    name: "Generation X",
    period: "1965 - 1980",
    translate: (text) => {
      // Add Gen X cynicism and references
      return text
        .replace(/exciting/gi, "whatever")
        .replace(/great/gi, "decent")
        + " *eye roll*";
    }
  },
  {
    name: "Baby Boomers",
    period: "1946 - 1964",
    translate: (text) => {
      // Add Boomer phrases and references
      return text
        .replace(/phone/gi, "cellular telephone")
        .replace(/internet/gi, "world wide web")
        + " Back in my day...";
    }
  },
  {
    name: "Silent Generation",
    period: "1928 - 1945",
    translate: (text) => {
      // Add formal, traditional language
      return "Well, I declare! " + text
        .replace(/cool/gi, "swell")
        .replace(/friend/gi, "chum");
    }
  }
];

// Helper function to get random generations
export const getRandomGenerations = (count) => {
  const shuffled = [...generations].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 