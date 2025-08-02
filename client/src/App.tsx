import React, { useState, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { AuthForm } from "./components/AuthForm";
import { Layout } from "./components/Layout";
import { Loader2 } from "lucide-react";

// ✨ LAZY LOADING: This tells React to only load ActorRunner when it's needed.
const ActorRunner = React.lazy(() =>
  import("./components/ActorRunner").then((module) => ({
    default: module.ActorRunner,
  }))
);

// A simple loading placeholder for the lazy-loaded component
const FullPageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const renderContent = () => {
    if (!isAuthenticated) {
      return <AuthForm onSuccess={() => setIsAuthenticated(true)} />;
    }
    // Suspense is a React feature that waits for the lazy component to load
    return (
      <Suspense fallback={<FullPageLoader />}>
        <ActorRunner />
      </Suspense>
    );
  };

  return (
    // Wrap the entire app in the new Layout component
    <Layout>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex flex-col items-center flex-1 p-4">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;
