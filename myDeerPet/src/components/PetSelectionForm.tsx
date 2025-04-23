"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";

interface PetSelectionFormProps {
  onComplete: () => void;
}

export default function PetSelectionForm({
  onComplete,
}: PetSelectionFormProps) {
  const [username, setUsername] = useState("");
  const [pet, setPet] = useState("");
  const [storyMode, setStoryMode] = useState("");
  const [customStory, setCustomStory] = useState("");
  const [showCustomStory, setShowCustomStory] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [returningUserData, setReturningUserData] = useState<{
    username: string;
    petType: string;
    hasMemory: boolean;
  } | null>(null);

  useEffect(() => {
    // Check if there's existing user data in localStorage
    const existingUsername = localStorage.getItem("username");
    const existingPetType = localStorage.getItem("petType");
    const existingMemory = localStorage.getItem("ziziMemory");

    if (existingUsername && existingPetType) {
      setReturningUserData({
        username: existingUsername,
        petType: existingPetType,
        hasMemory: !!existingMemory,
      });
    }
  }, []);

  const handleStoryModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStoryMode(value);
    setShowCustomStory(value === "custom");
  };

  const handleUserTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsReturningUser(e.target.value === "returning");

    // If returning user, pre-fill the form with existing data
    if (e.target.value === "returning" && returningUserData) {
      setUsername(returningUserData.username);
      setPet(returningUserData.petType);
    } else {
      // Clear form for new users
      setUsername("");
      setPet("");
      setStoryMode("");
      setCustomStory("");
      setShowCustomStory(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // For new users, save all data
    if (!isReturningUser) {
      localStorage.setItem("userHasVisited", "true");
      localStorage.setItem("username", username);
      localStorage.setItem("petType", pet);
      localStorage.setItem("storyMode", storyMode);

      if (storyMode === "custom") {
        localStorage.setItem("customStory", customStory);
      }
    } else {
      // For returning users, just update the userHasVisited flag
      // but keep their existing data
      localStorage.setItem("userHasVisited", "true");

      // Update username and pet type if they changed
      if (username !== returningUserData?.username) {
        localStorage.setItem("username", username);
      }

      if (pet !== returningUserData?.petType) {
        localStorage.setItem("petType", pet);
      }
    }

    onComplete();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
      <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Welcome to Zizi Pet
      </h1>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">Are you a new or returning user?</p>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="userType"
              value="new"
              checked={!isReturningUser}
              onChange={handleUserTypeChange}
              className="h-4 w-4 text-pink-500"
            />
            <span>New User</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="userType"
              value="returning"
              checked={isReturningUser}
              onChange={handleUserTypeChange}
              className="h-4 w-4 text-pink-500"
              disabled={!returningUserData}
            />
            <span>Returning User</span>
          </label>
        </div>
      </div>

      {isReturningUser && returningUserData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Welcome back! We found your pet {returningUserData.petType}
            {returningUserData.hasMemory ? " and all your chat history." : "."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block font-semibold text-gray-700 mb-2"
          >
            Enter your username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 text-base rounded-lg border border-gray-300"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="pet"
            className="block font-semibold text-gray-700 mb-2"
          >
            Select a Pet
          </label>
          <select
            id="pet"
            value={pet}
            onChange={(e) => setPet(e.target.value)}
            className="w-full p-3 text-base rounded-lg border border-gray-300"
            required
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="dog">Dog 🐶</option>
            <option value="cat">Cat 🐱</option>
            <option value="panda">Panda 🐼</option>
            <option value="bird">Bird 🐦</option>
          </select>
        </div>

        {!isReturningUser && (
          <>
            <div className="mb-4">
              <label
                htmlFor="story"
                className="block font-semibold text-gray-700 mb-2"
              >
                Story Mode
              </label>
              <select
                id="story"
                value={storyMode}
                onChange={handleStoryModeChange}
                className="w-full p-3 text-base rounded-lg border border-gray-300"
                required
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="generate">Let AI generate the story</option>
                <option value="custom">I will write the story</option>
              </select>
            </div>

            {showCustomStory && (
              <div className="mb-4">
                <label
                  htmlFor="customStory"
                  className="block font-semibold text-gray-700 mb-2"
                >
                  Write Your Pet's Story
                </label>
                <textarea
                  id="customStory"
                  value={customStory}
                  onChange={(e) => setCustomStory(e.target.value)}
                  placeholder="Once upon a time..."
                  className="w-full p-3 text-base rounded-lg border border-gray-300 min-h-[100px] resize-y"
                  required={showCustomStory}
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3 px-4 rounded-lg mt-6 hover:from-orange-500 hover:to-pink-600 transition-colors"
        >
          {isReturningUser ? "Continue to Chat" : "Create My Pet"}
        </button>
      </form>
    </div>
  );
}
