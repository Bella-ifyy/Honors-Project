import { Injectable } from "@nestjs/common";

@Injectable()
export class AutoCategorizationService {
  constructor() {}

  async categorizeContent(
    title: string,
    content: string,
    userUUID: string,
  ): Promise<string> {
    const combinedText = `${title} ${content}`.toLowerCase();

    const categoryKeywords = {
      work: [
        "work",
        "office",
        "meeting",
        "project",
        "deadline",
        "client",
        "team",
        "presentation",
        "report",
        "email",
        "call",
        "conference",
        "business",
        "professional",
        "job",
        "task",
        "assignment",
        "boss",
        "colleague",
      ],
      personal: [
        "personal",
        "home",
        "family",
        "friend",
        "birthday",
        "anniversary",
        "vacation",
        "holiday",
        "weekend",
        "hobby",
        "health",
        "fitness",
        "exercise",
        "doctor",
        "appointment",
        "self",
        "me",
        "my",
      ],
      shopping: [
        "shopping",
        "buy",
        "purchase",
        "store",
        "shop",
        "mall",
        "order",
        "grocery",
        "groceries",
        "market",
        "supermarket",
        "items",
        "list",
      ],
      health: [
        "health",
        "fitness",
        "gym",
        "workout",
        "exercise",
        "diet",
        "nutrition",
        "doctor",
        "hospital",
        "medicine",
        "medical",
        "therapy",
        "wellness",
      ],
      finance: [
        "finance",
        "money",
        "budget",
        "payment",
        "bill",
        "invoice",
        "bank",
        "savings",
        "investment",
        "expense",
        "income",
        "salary",
        "tax",
      ],
      learning: [
        "learn",
        "study",
        "course",
        "tutorial",
        "education",
        "class",
        "lesson",
        "training",
        "skill",
        "book",
        "read",
        "research",
        "university",
        "school",
      ],
      ideas: [
        "idea",
        "thought",
        "brainstorm",
        "concept",
        "plan",
        "strategy",
        "inspiration",
        "creative",
        "innovation",
        "note",
        "reminder",
        "memo",
      ],
    };

    const categoryScores: { [key: string]: number } = {};

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) {
          score++;
        }
      }
      categoryScores[category] = score;
    }

    const bestCategory = Object.keys(categoryScores).reduce((a, b) =>
      categoryScores[a] > categoryScores[b] ? a : b,
    );

    return this.capitalizeFirstLetter(bestCategory);
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async suggestProjectName(title: string, content: string): Promise<string> {
    const combinedText = `${title} ${content}`.toLowerCase();

    const words = combinedText.split(/\s+/);
    const meaningfulWords = words.filter((word) => word.length > 4);

    if (meaningfulWords.length > 0) {
      return this.capitalizeFirstLetter(meaningfulWords[0]);
    }

    return "General";
  }
}
