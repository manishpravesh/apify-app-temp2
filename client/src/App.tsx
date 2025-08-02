import React, { useState, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { AuthForm } from "./components/AuthForm";
import { Layout } from "./components/Layout";
import { Loader2 } from "lucide-react";

// This tells React to only load the ActorRunner component's code when it's first needed
const ActorRunner = React.lazy(() =>
  import("./components/ActorRunner").then((module) => ({
    default: module.ActorRunner,
  }))
);

// A simple loading spinner to show while the ActorRunner code is being downloaded
const FullPageLoader = () => (
  <div className="flex items-center justify-center flex-1">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This function decides which component to show based on the authentication state
  const renderContent = () => {
    if (!isAuthenticated) {
      return <AuthForm onSuccess={() => setIsAuthenticated(true)} />;
    }
    // Suspense waits for the lazy-loaded component to download before rendering it
    return (
      <Suspense fallback={<FullPageLoader />}>
        <ActorRunner />
      </Suspense>
    );
  };

  return (
    <Layout>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex flex-col items-center flex-1 p-4">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;
