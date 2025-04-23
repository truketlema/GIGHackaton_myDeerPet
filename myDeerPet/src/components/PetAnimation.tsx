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

interface PetAnimationProps {
  petType: string;
  emotion: EmotionType;
}

export default function PetAnimation({ petType, emotion }: PetAnimationProps) {
  // Map emotions to colors and animation styles
  const getEmotionStyles = (emotion: EmotionType) => {
    const styles: Record<EmotionType, { color: string; animation: string }> = {
      Happy: { color: "#FFD700", animation: "bounce" },
      Sad: { color: "#6495ED", animation: "pulse-slow" },
      Angry: { color: "#FF4500", animation: "shake" },
      Fearful: { color: "#800080", animation: "tremble" },
      Surprised: { color: "#FF69B4", animation: "pop" },
      Disgusted: { color: "#7CFC00", animation: "wiggle" },
      Confused: { color: "#FF8C00", animation: "spin-slow" },
      Excited: { color: "#FF1493", animation: "jump" },
      Calm: { color: "#20B2AA", animation: "float" },
      Anxious: { color: "#9370DB", animation: "pulse-fast" },
      Hopeful: { color: "#00BFFF", animation: "glow" },
      Frustrated: { color: "#B22222", animation: "vibrate" },
      Lonely: { color: "#708090", animation: "fade" },
      Grateful: { color: "#32CD32", animation: "wave" },
      Neutral: { color: "#C0C0C0", animation: "breathe" },
      Unknown: { color: "#A9A9A9", animation: "breathe" },
    };

    return styles[emotion] || styles.Neutral;
  };

  // Get pet-specific features
  const getPetFeatures = (petType: string) => {
    const features: Record<
      string,
      { ears: string; face: string; nose: string }
    > = {
      dog: {
        ears: "rounded-full w-8 h-12 bg-current",
        face: "rounded-full",
        nose: "rounded-full w-6 h-4 bg-black",
      },
      cat: {
        ears: "w-8 h-12 bg-current rotate-45",
        face: "rounded-full",
        nose: "w-4 h-3 bg-pink-300 rounded-sm",
      },
      panda: {
        ears: "rounded-full w-10 h-10 bg-black",
        face: "rounded-full",
        nose: "rounded-full w-6 h-4 bg-black",
      },
      bird: {
        ears: "hidden",
        face: "rounded-full",
        nose: "w-8 h-6 bg-yellow-500 rotate-90 rounded-t-full",
      },
    };

    return features[petType.toLowerCase()] || features.dog;
  };

  const emotionStyle = getEmotionStyles(emotion);
  const petFeatures = getPetFeatures(petType);

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col items-center h-full">
      <h3 className="text-lg font-semibold mb-4">
        Your {petType} is feeling {emotion}
      </h3>

      <div className="flex-1 w-full flex items-center justify-center">
        <div
          className={`relative ${emotionStyle.animation}`}
          style={{ color: emotionStyle.color }}
        >
          {/* Pet body */}
          <div
            className={`w-48 h-48 ${petFeatures.face} bg-current relative flex items-center justify-center`}
          >
            {/* Eyes */}
            <div className="absolute flex space-x-12 top-12">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
            </div>

            {/* Nose */}
            <div className={`absolute ${petFeatures.nose} top-24`}></div>

            {/* Mouth - changes with emotion */}
            <div
              className={`absolute top-32 w-16 h-8 ${
                emotion === "Happy" || emotion === "Excited"
                  ? "border-b-4 border-black rounded-b-full"
                  : emotion === "Sad" || emotion === "Lonely"
                  ? "border-t-4 border-black rounded-t-full"
                  : emotion === "Surprised"
                  ? "w-8 h-8 bg-black rounded-full"
                  : emotion === "Angry" || emotion === "Frustrated"
                  ? "w-16 h-1 bg-black"
                  : "w-8 h-2 bg-black rounded-full"
              }`}
            ></div>
          </div>

          {/* Ears */}
          <div className="absolute -top-10 left-4">
            <div className={petFeatures.ears}></div>
          </div>
          <div className="absolute -top-10 right-4">
            <div className={petFeatures.ears}></div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-2 rounded-lg bg-gray-100 text-center">
        <p className="text-sm text-gray-600">
          {emotion === "Happy"
            ? "Your pet is wagging with joy!"
            : emotion === "Sad"
            ? "Your pet looks a bit down..."
            : emotion === "Angry"
            ? "Your pet is feeling grumpy!"
            : emotion === "Fearful"
            ? "Your pet seems scared of something."
            : emotion === "Surprised"
            ? "Your pet is totally shocked!"
            : emotion === "Confused"
            ? "Your pet tilts its head in confusion."
            : emotion === "Excited"
            ? "Your pet is bouncing with excitement!"
            : emotion === "Calm"
            ? "Your pet is feeling peaceful."
            : emotion === "Anxious"
            ? "Your pet seems a bit nervous."
            : emotion === "Hopeful"
            ? "Your pet looks up with anticipation."
            : emotion === "Frustrated"
            ? "Your pet is feeling impatient."
            : emotion === "Lonely"
            ? "Your pet could use some company."
            : emotion === "Grateful"
            ? "Your pet appreciates your attention!"
            : "Your pet is just chilling."}
        </p>
      </div>
    </div>
  );
}
