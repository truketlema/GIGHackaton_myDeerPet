"use client";

import { useState, useEffect } from "react";
import PetSelectionForm from "./components/PetSelectionForm";
import ChatInterface from "./components/ChatInterface";
import { AppProvider } from "./Context/AppContext";

function App() {
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    // Check if user has already selected a pet
    const userHasVisited = localStorage.getItem("userHasVisited") === "true";
    setHasVisited(userHasVisited);
  }, []);

  const handlePetSelection = () => {
    setHasVisited(true);
  };

  const handleLogout = () => {
    setHasVisited(false);
  };

  return (
    <AppProvider>
      <main className="min-h-screen flex justify-center items-center p-4">
        {!hasVisited ? (
          <PetSelectionForm onComplete={handlePetSelection} />
        ) : (
          <ChatInterface onLogout={handleLogout} />
        )}
      </main>
    </AppProvider>
  );
}

export default App;
