import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthForm } from "./components/AuthForm";
import { ActorRunner } from "./components/ActorRunner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <main className="flex flex-col items-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        {!isAuthenticated ? (
          <AuthForm onSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <ActorRunner />
        )}
      </main>
    </>
  );
}

export default App;
