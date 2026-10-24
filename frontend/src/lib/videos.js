
const topics = [
  "AI tools", "Product launches", "Creator marketing",
  "Fitness", "Technology", "Business", "Design",
  "Gaming", "Cooking", "Travel"
];

const titles = [
  "Tools That Actually Save Time",
  "I Tested the Newest Apps",
  "Build Something From Scratch",
  "A Workflow That Works",
  "The Strategy Behind Great Products",
  "A Beginner's Guide",
  "Ideas Worth Exploring",
  "Inside the Creative Process",
  "Five Tips to Improve Your Skills",
  "What You Should Know This Year"
];

const creators = [
  "Studio North", "Maya Chen", "The Daily Build",
  "Alex Rivera", "Future Form", "Better Systems",
  "Nora Creates", "Field Notes", "Pixel Practice",
  "The Modern Method"
];

const descriptions = [
  "A practical breakdown with examples and useful takeaways.",
  "Follow the process from the first idea to the finished result.",
  "A closer look at the tools and techniques behind the outcome.",
  "Real-world examples and lessons to improve your workflow."
];

export const videos = Array.from({ length: 100 }, (_, i) => {
  const topic = topics[i % topics.length];
  const title = `${titles[i % titles.length]} — ${topic}`;

  return {
    id: `mock-${String(i + 1).padStart(3, "0")}`,
    title,
    description: descriptions[i % descriptions.length],
    thumbnail: `https://picsum.photos/seed/vind-${i + 1}/640/900`,
    creator: creators[i % creators.length],
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
    views: (i + 1) * 1379,
    likes: (i + 1) * 83,
    publishedAt: new Date(
      Date.now() - i * 3 * 86400000
    ).toISOString(),
    category: topic,
    isMock: true
  };
});
