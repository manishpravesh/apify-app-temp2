import { useState, useEffect } from "react";
import { apiClient } from "./lib/api";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Loader2 } from "lucide-react";

// Interfaces for our data shapes
interface Actor {
  id: string;
  name: string;
}
interface ActorSchema {
  properties: Record<
    string,
    {
      type: string;
      description: string;
      title: string;
      default?: any;
      editor?: string;
    }
  >;
}
interface ActorRunResult {
  runInfo: object;
  results: any[];
}

// Reusable Loading Component
const LoadingSpinner = () => <Loader2 className="mr-2 h-4 w-4 animate-spin" />;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActorId, setSelectedActorId] = useState("");
  const [actorSchema, setActorSchema] = useState<ActorSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [runResult, setRunResult] = useState<ActorRunResult | null>(null);
  const [isLoading, setIsLoading] = useState({
    auth: false,
    actors: false,
    schema: false,
    run: false,
  });

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading((prev) => ({ ...prev, auth: true }));
    const apiKey = (
      event.currentTarget.elements.namedItem("api-key") as HTMLInputElement
    ).value;
    try {
      await apiClient.post("/verify-key", { apiKey });
      toast.success("API Key Verified!");
      setIsAuthenticated(true);
    } catch {
      toast.error("Authentication Failed.");
    } finally {
      setIsLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchActors = async () => {
      setIsLoading((prev) => ({ ...prev, actors: true }));
      try {
        const response = await apiClient.get<Actor[]>("/actors");
        setActors(response.data);
      } catch {
        toast.error("Failed to fetch actors.");
      } finally {
        setIsLoading((prev) => ({ ...prev, actors: false }));
      }
    };
    fetchActors();
  }, [isAuthenticated]);

  const handleActorSelect = async (actorId: string) => {
    setSelectedActorId(actorId);
    setIsLoading((prev) => ({ ...prev, schema: true }));
    setActorSchema(null);
    setRunResult(null);
    try {
      const response = await apiClient.get(`/actors/${actorId}`);
      const schema = response.data.inputSchema as ActorSchema;
      setActorSchema(schema);
      const initialData: Record<string, any> = {};
      if (schema?.properties) {
        Object.keys(schema.properties).forEach((key) => {
          initialData[key] = schema.properties[key].default ?? "";
        });
      }
      setFormData(initialData);
    } catch {
      toast.error("Failed to fetch actor schema.");
    } finally {
      setIsLoading((prev) => ({ ...prev, schema: false }));
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRunActor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading((prev) => ({ ...prev, run: true }));
    setRunResult(null);
    const promise = apiClient.post<ActorRunResult>(
      `/actors/${selectedActorId}/run`,
      formData
    );
    toast.promise(promise, {
      loading: "Running actor...",
      success: (response) => {
        setRunResult(response.data);
        return "Actor run completed!";
      },
      error: "Actor run failed.",
    });
    try {
      await promise;
    } catch {
    } finally {
      setIsLoading((prev) => ({ ...prev, run: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex items-center justify-center min-h-screen p-4">
        <Toaster />
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Connect to Apify</CardTitle>
            <CardDescription>Enter your API key to continue.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  required
                  placeholder="apify_api_..."
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading.auth}
              >
                {isLoading.auth && <LoadingSpinner />} Connect
              </Button>
            </CardContent>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <>
      <Toaster />
      <main className="container mx-auto p-4 sm:p-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Select Actor</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading.actors ? (
              <p>Loading actors...</p>
            ) : (
              <Select onValueChange={handleActorSelect} value={selectedActorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an actor..." />
                </SelectTrigger>
                <SelectContent>
                  {actors.map((actor) => (
                    <SelectItem key={actor.id} value={actor.id}>
                      {actor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {isLoading.schema && <p className="text-center">Loading schema...</p>}
        {actorSchema?.properties && (
          <Card>
            <CardHeader>
              <CardTitle>2. Actor Input</CardTitle>
            </CardHeader>
            <form onSubmit={handleRunActor}>
              <CardContent className="space-y-4">
                {Object.entries(actorSchema.properties).map(([key, prop]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{prop.title || key}</Label>
                    <p className="text-sm text-muted-foreground mb-1">
                      {prop.description}
                    </p>
                    <Input
                      id={key}
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  </div>
                ))}
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isLoading.run}
                >
                  {isLoading.run && <LoadingSpinner />} Run Actor
                </Button>
              </CardContent>
            </form>
          </Card>
        )}

        {isLoading.run && <p className="text-center">Running actor...</p>}
        {runResult && (
          <Card>
            <CardHeader>
              <CardTitle>3. Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96">
                <code>{JSON.stringify(runResult.results, null, 2)}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
export default App;
