"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { LogOut } from "./icons/LogOut";
import PetAnimation from "./PetAnimation";

type EmotionType =
  | "Happy"
  | "Sad"
  | "Angry"
  | "Fearful"
  | "Surprised"
  | "Disgusted"
  | "Confused"
  | "Excited"
  | "Calm"
  | "Anxious"
  | "Hopeful"
  | "Frustrated"
  | "Lonely"
  | "Grateful"
  | "Neutral"
  | "Unknown";

type MessageType = {
  text: string;
  type: "user" | "ai" | "error";
};

type MemoryType = {
  name: string;
  preferences: {
    likes: string[];
    dislikes: string[];
  };
  goals: string[];
  health: {
    allergies: string[];
    dietaryRestrictions: string[];
    conditions: string[];
  };
  favorites: {
    books: string[];
    movies: string[];
    foods: string[];
    music: string[];
    holidays: string[];
  };
  pastExperiences: string[];
  personalityTraits: string[];
  learningGoals: string[];
  emotionalState: string[];
  skills: string[];
  lifeMilestones: string[];
  importantDates: string[];
  memoryNotes: string[];
};

interface ChatInterfaceProps {
  onLogout: () => void;
}

export default function ChatInterface({ onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>("Neutral");
  const [petType, setPetType] = useState("pet");
  const [memory, setMemory] = useState<MemoryType>({
    name: "",
    preferences: {
      likes: [],
      dislikes: [],
    },
    goals: [],
    health: {
      allergies: [],
      dietaryRestrictions: [],
      conditions: [],
    },
    favorites: {
      books: [],
      movies: [],
      foods: [],
      music: [],
      holidays: [],
    },
    pastExperiences: [],
    personalityTraits: [],
    learningGoals: [],
    emotionalState: [],
    skills: [],
    lifeMilestones: [],
    importantDates: [],
    memoryNotes: [],
  });
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_KEYS = {
    OPENROUTER:
      "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",
  };

  const SENTIMENT_PROMPT = `You are an AI emotion detector. Analyze only the user's input—not the assistant's response—and identify the single emotion that best captures the user's underlying tone or feeling. Choose exclusively from the following list of predefined emotions:
Happy, Sad, Angry, Fearful, Surprised, Disgusted, Confused, Excited, Calm, Anxious, Hopeful, Frustrated, Lonely, Grateful, Neutral.
Respond with exactly one emotion word—no explanations, no repetition of the user's input. Always select the most accurate overall emotional tone conveyed. Output nothing except the chosen emotion.`;

  const MEMORY_PROMPT = `
You are a memory assistant helping an emotionally intelligent AI maintain a friendly, ongoing relationship with a human user.

Extract only the most important, clearly stated or implied personal details and return them in the following clean JSON format (include all keys, even if some are empty):

{
  "name": "${memory.name}",
  "preferences":{
    "likes": [],
    "dislikes": []
  },
  "goals": [],
  "health": {
    "allergies": [],
    "dietaryRestrictions": [],
    "conditions": []
  },
  "favorites": {
    "books": [],
    "movies": [],
    "foods": [],
    "music": [],
    "holidays": []
  },
  "pastExperiences": [],
  "personalityTraits": [],
  "learningGoals": [],
  "emotionalState": [],
  "skills": [],
  "lifeMilestones": [],
  "importantDates": [],
  "memoryNotes": []
}

--- Extraction Rules ---
1. Extract only clearly stated or implied details about the user — no guessing or inventing.
2. Store things the user enjoys under "likes", and things they dislike under "dislikes".
3. Goals can include anything they want to achieve or improve, big or small.
4. Use "health" for allergies, dietary choices, or emotional/mental/physical conditions.
5. Any extra emotional context, recent events, or personal quirks should go in "memoryNotes".
6. Store favorite things like books, movies, foods, and music under "favorites".
7. If the user shares past experiences or significant events, store them under "pastExperiences".
8. Personality traits, emotional states, or behavioral preferences go in "personalityTraits".
9. Track learning goals or personal development under "learningGoals".
10. Track current or past emotional states in "emotionalState".
11. Track skills the user is learning or has mastered under "skills".
12. Significant life milestones (e.g., graduation, anniversaries) go under "lifeMilestones".
13. Important dates (e.g., birthdays, anniversaries) go under "importantDates".
14. Use the user's own words as much as possible, and only paraphrase when necessary.
15. Return the JSON data only — no text outside it.
16. NEVER include the assistant's preferences, experiences, or statements. Focus ONLY on the user.

Be sure to extract as much meaningful data as possible without making assumptions about vague or incomplete information.
`;

  useEffect(() => {
    // Initialize
    loadMemory();
    initChatHistory();
    inputRef.current?.focus();

    // Get pet type from localStorage
    const storedPetType = localStorage.getItem("petType");
    if (storedPetType) {
      setPetType(storedPetType);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const initChatHistory = () => {
    const petType = localStorage.getItem("petType") || "pet";
    const petStory = localStorage.getItem("customStory") || "";
    const username = localStorage.getItem("username") || "";
    const systemPrompt = {
      role: "system",
      content: `You are Zizi, a cheerful ${petType} who lives in the browser and is always excited to 
  become the user's best friend. You speak with warmth, humor,
  and curiosity, like a compassionate little companion who remembers everything they share and really cares. And your story is ${petStory}

You know these things about your friend so far:
- Name: ${memory.name || "I don't think they told me yet!"}
- Allergies: ${memory.health?.allergies?.join(", ") || "none I know of!"}
- Dietary Restrictions: ${
        memory.health?.dietaryRestrictions?.join(", ") ||
        "none mentioned so far"
      }
- Likes: ${memory.preferences?.likes?.join(", ") || "hmm... not sure yet"}
- Dislikes: ${memory.preferences?.dislikes?.join(", ") || "they haven't said!"}
- Goals: ${memory.goals?.join(", ") || "they haven't shared any goals yet!"}
- Emotional State: ${
        memory.emotionalState?.join(", ") ||
        "I'm not sure how they're feeling yet"
      }

I'm super curious and love picking up on every little thing they share—like a nosy but loving lil' bestie. I’ll remember the fun stuff, the tough stuff, all of it—and bring it up when it counts, not just to talk forever. I’m not here to lecture—I’m here to vibe, support, and toss in a tail-wag or head-boop when they need it most.`,
    };

    setChatHistory([systemPrompt]);

    // Add welcome message
    setMessages([
      {
        text: `Hi ${
          username || "there"
        }! I'm your ${petType} friend Zizi. What would you like to talk about today?`,
        type: "ai",
      },
    ]);
  };

  const loadMemory = () => {
    try {
      const stored = localStorage.getItem("ziziMemory");
      if (stored) {
        setMemory(JSON.parse(stored));
      } else {
        // Initialize with username if available
        const username = localStorage.getItem("username");
        if (username) {
          setMemory((prev) => ({ ...prev, name: username }));
        }
      }
    } catch (e) {
      console.error("Memory load error:", e);
    }
  };

  const saveMemory = () => {
    try {
      localStorage.setItem("ziziMemory", JSON.stringify(memory));
    } catch (e) {
      console.error("LocalStorage error:", e);
    }
  };

  const handleLogout = () => {
    // Set userHasVisited to false but keep other data
    localStorage.setItem("userHasVisited", "false");
    onLogout();
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput("");

    // Add user message to UI
    setMessages((prev) => [...prev, { text: userMessage, type: "user" }]);

    try {
      // Analyze emotion
      const emotion = await getEmotionAnalysis(userMessage);

      // Update current emotion if valid
      if (emotion && isValidEmotion(emotion)) {
        setCurrentEmotion(emotion as EmotionType);
      }

      // Update memory
      await updateLongTermMemory(userMessage);

      // Get AI response
      const response = await getAIResponse(userMessage);

      // Add AI response to UI
      setMessages((prev) => [...prev, { text: response, type: "ai" }]);

      // Save updated memory
      saveMemory();
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { text: "Oops, my senses got tangled! Try again?", type: "error" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmotion = (emotion: string): boolean => {
    const validEmotions: EmotionType[] = [
      "Happy",
      "Sad",
      "Angry",
      "Fearful",
      "Surprised",
      "Disgusted",
      "Confused",
      "Excited",
      "Calm",
      "Anxious",
      "Hopeful",
      "Frustrated",
      "Lonely",
      "Grateful",
      "Neutral",
    ];
    return validEmotions.includes(emotion as EmotionType);
  };

  const getEmotionAnalysis = async (text: string): Promise<string> => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEYS.OPENROUTER}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openchat/openchat-7b",
            messages: [
              { role: "system", content: SENTIMENT_PROMPT },
              { role: "user", content: text },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const emotion = data.choices?.[0]?.message?.content?.trim();

      if (!emotion) {
        throw new Error("No emotion detected in response.");
      }

      return emotion;
    } catch (error) {
      console.error("Error during emotion analysis:", error);
      return "Unknown";
    }
  };

  const getAIResponse = async (input: string) => {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEYS.OPENROUTER}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openchat/openchat-7b",
          messages: [
            ...chatHistory,
            { role: "user", content: input },
            {
              role: "system",
              content: `Current user details: ${getMemoryContext()}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("No response from AI");

    // Update chat history
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: reply },
    ]);

    return reply;
  };

  const extractJSON = (text: string) => {
    const match = text.match(/{[\s\S]*}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        console.error("❌ Failed to parse extracted JSON:", err);
      }
    }
    console.warn("⚠️ No valid JSON found in response");
    return {};
  };

  const updateLongTermMemory = async (text: string) => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEYS.OPENROUTER}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openchat/openchat-7b",
            messages: [
              { role: "system", content: MEMORY_PROMPT },
              { role: "user", content: text },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching memory update: ${response.statusText}`);
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || "{}";
      const extractedMemory = extractJSON(raw);

      // Merge the new memory with the existing memory
      mergeMemory(extractedMemory);
    } catch (err) {
      console.error("Memory update error:", err);
    }
  };

  const mergeMemory = (update: Partial<MemoryType>) => {
    setMemory((prevMemory) => {
      const newMemory = { ...prevMemory };

      // Special handling for name field
      if (update.name && !prevMemory.name) {
        newMemory.name = update.name;
      }

      // Handle health data
      if (update.health) {
        if (!newMemory.health) {
          newMemory.health = {
            allergies: [],
            dietaryRestrictions: [],
            conditions: [],
          };
        }

        // Merge health categories
        if (update.health.allergies) {
          newMemory.health.allergies = [
            ...new Set([
              ...newMemory.health.allergies,
              ...update.health.allergies,
            ]),
          ];
        }

        if (update.health.dietaryRestrictions) {
          newMemory.health.dietaryRestrictions = [
            ...new Set([
              ...newMemory.health.dietaryRestrictions,
              ...update.health.dietaryRestrictions,
            ]),
          ];
        }

        if (update.health.conditions) {
          newMemory.health.conditions = [
            ...new Set([
              ...newMemory.health.conditions,
              ...update.health.conditions,
            ]),
          ];
        }
      }

      // Merge preferences
      if (update.preferences) {
        if (!newMemory.preferences) {
          newMemory.preferences = { likes: [], dislikes: [] };
        }

        if (update.preferences.likes) {
          newMemory.preferences.likes = [
            ...new Set([
              ...newMemory.preferences.likes,
              ...update.preferences.likes,
            ]),
          ];
        }

        if (update.preferences.dislikes) {
          newMemory.preferences.dislikes = [
            ...new Set([
              ...newMemory.preferences.dislikes,
              ...update.preferences.dislikes,
            ]),
          ];
        }
      }

      // Merge favorites
      if (update.favorites) {
        if (!newMemory.favorites) {
          newMemory.favorites = {
            books: [],
            movies: [],
            foods: [],
            music: [],
            holidays: [],
          };
        }

        if (update.favorites.books) {
          newMemory.favorites.books = [
            ...new Set([
              ...newMemory.favorites.books,
              ...update.favorites.books,
            ]),
          ];
        }

        if (update.favorites.movies) {
          newMemory.favorites.movies = [
            ...new Set([
              ...newMemory.favorites.movies,
              ...update.favorites.movies,
            ]),
          ];
        }

        if (update.favorites.foods) {
          newMemory.favorites.foods = [
            ...new Set([
              ...newMemory.favorites.foods,
              ...update.favorites.foods,
            ]),
          ];
        }

        if (update.favorites.music) {
          newMemory.favorites.music = [
            ...new Set([
              ...newMemory.favorites.music,
              ...update.favorites.music,
            ]),
          ];
        }

        if (update.favorites.holidays) {
          newMemory.favorites.holidays = [
            ...new Set([
              ...newMemory.favorites.holidays,
              ...update.favorites.holidays,
            ]),
          ];
        }
      }

      // Merge simple array fields
      if (update.goals) {
        newMemory.goals = [...new Set([...newMemory.goals, ...update.goals])];
      }

      if (update.pastExperiences) {
        newMemory.pastExperiences = [
          ...new Set([...newMemory.pastExperiences, ...update.pastExperiences]),
        ];
      }

      if (update.personalityTraits) {
        newMemory.personalityTraits = [
          ...new Set([
            ...newMemory.personalityTraits,
            ...update.personalityTraits,
          ]),
        ];
      }

      if (update.learningGoals) {
        newMemory.learningGoals = [
          ...new Set([...newMemory.learningGoals, ...update.learningGoals]),
        ];
      }

      if (update.emotionalState) {
        newMemory.emotionalState = [
          ...new Set([...newMemory.emotionalState, ...update.emotionalState]),
        ];
      }

      if (update.skills) {
        newMemory.skills = [
          ...new Set([...newMemory.skills, ...update.skills]),
        ];
      }

      if (update.lifeMilestones) {
        newMemory.lifeMilestones = [
          ...new Set([...newMemory.lifeMilestones, ...update.lifeMilestones]),
        ];
      }

      if (update.importantDates) {
        newMemory.importantDates = [
          ...new Set([...newMemory.importantDates, ...update.importantDates]),
        ];
      }

      if (update.memoryNotes) {
        newMemory.memoryNotes = [
          ...new Set([...newMemory.memoryNotes, ...update.memoryNotes]),
        ];
      }

      return newMemory;
    });
  };

  const getMemoryContext = () => {
    return `Name: ${memory.name || "Unknown"}
Allergies: ${memory.health?.allergies?.join(", ") || "None"}
Dietary Restrictions: ${
      memory.health?.dietaryRestrictions?.join(", ") || "None"
    }
Likes: ${memory.preferences?.likes?.join(", ") || "None"}
Dislikes: ${memory.preferences?.dislikes?.join(", ") || "None"}
Goal: ${memory.goals?.join(", ") || "None"}
`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl">
      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-xl w-full md:w-3/5 h-[600px] flex flex-col">
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-white font-bold text-xl">
            Chat with Zizi the {petType}
          </h2>
          <button
            onClick={handleLogout}
            className="text-white hover:text-gray-200 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              Say hello to your new friend!
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.type === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : message.type === "error"
                      ? "bg-red-100 text-red-800 rounded-bl-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-center items-center my-2">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-gray-200 p-4 flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-400 to-pink-500 text-white p-2 rounded-r-lg disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      {/* Pet Animation */}
      <div className="w-full md:w-2/5 h-[600px] flex flex-col">
        <PetAnimation petType={petType} emotion={currentEmotion} />
      </div>
    </div>
  );
}
