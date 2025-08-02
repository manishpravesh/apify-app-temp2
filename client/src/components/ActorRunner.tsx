import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Loader2, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Interfaces ---
interface Actor {
  id: string;
  name: string;
  username: string;
}
interface ActorSchemaResponse {
  inputSchema: any;
}
interface ActorRunResult {
  results: any[];
}

// ✨ NEW: Upgraded ResultsDisplay Component
function ResultsDisplay({ results }: { results: any[] }) {
  const handleDownload = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(results, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "actor_results.json";
    link.click();
  };

  // Check if results can be displayed as a table
  const isTableData =
    Array.isArray(results) &&
    results.length > 0 &&
    typeof results[0] === "object" &&
    results[0] !== null;
  const headers = isTableData ? Object.keys(results[0]) : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>3. Results</CardTitle>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Download JSON
        </Button>
      </CardHeader>
      <CardContent>
        {isTableData ? (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header) => (
                      <TableCell
                        key={`${rowIndex}-${header}`}
                        className="max-w-xs truncate"
                      >
                        {typeof row[header] === "object"
                          ? JSON.stringify(row[header])
                          : String(row[header])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto max-h-[500px] text-sm">
            <code>{JSON.stringify(results, null, 2)}</code>
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main ActorRunner Component ---
export function ActorRunner() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActorName, setSelectedActorName] = useState("");
  const [actorSchema, setActorSchema] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [runResult, setRunResult] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState({
    actors: true,
    schema: false,
    run: false,
  });

  useEffect(() => {
    apiClient
      .get<Actor[]>("/actors")
      .then((response) => setActors(response.data))
      .catch(() => toast.error("Failed to fetch actors."))
      .finally(() => setIsLoading((prev) => ({ ...prev, actors: false })));
  }, []);

  const handleActorSelect = async (actorName: string) => {
    setSelectedActorName(actorName);
    setActorSchema(null);
    setRunResult(null);
    setFormData({});
    setIsLoading((prev) => ({ ...prev, schema: true }));

    try {
      const urlSafeActorName = actorName.replace("/", "~");
      const response = await apiClient.get<ActorSchemaResponse>(
        `/actors/${urlSafeActorName}/schema`
      );
      const schema = response.data.inputSchema;

      if (schema && schema.properties) {
        setActorSchema(schema);
        const initialData: Record<string, any> = {};
        for (const key in schema.properties) {
          initialData[key] =
            schema.properties[key].default ??
            (schema.properties[key].type === "boolean" ? false : "");
        }
        setFormData(initialData);
      } else {
        toast.error("No usable schema properties found for this actor.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch actor schema."
      );
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

    const formattedData: Record<string, any> = {};
    if (actorSchema?.properties) {
      for (const key in actorSchema.properties) {
        const prop = actorSchema.properties[key];
        const rawValue = formData[key];

        if (rawValue === null || rawValue === undefined || rawValue === "") {
          if (prop.type === "boolean") {
            formattedData[key] = false;
          }
          continue;
        }

        switch (prop.type) {
          case "array":
            formattedData[key] =
              typeof rawValue === "string"
                ? rawValue
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                : rawValue;
            break;
          case "integer":
            const num = parseInt(rawValue, 10);
            if (!isNaN(num)) {
              formattedData[key] = num;
            }
            break;
          case "object":
            if (key === "proxy") {
              if (rawValue === true) {
                formattedData[key] = { useApifyProxy: true };
              }
            } else {
              try {
                formattedData[key] = JSON.parse(rawValue);
              } catch {
                console.warn(
                  `Could not parse object from string for key: ${key}`
                );
              }
            }
            break;
          default:
            formattedData[key] = rawValue;
            break;
        }
      }
    }

    try {
      const urlSafeActorName = selectedActorName.replace("/", "~");
      const response = await apiClient.post<ActorRunResult>(
        `/actors/${urlSafeActorName}/run`,
        formattedData
      );
      setRunResult(response.data.results);
      toast.success("Actor run completed!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Actor run failed.");
    } finally {
      setIsLoading((prev) => ({ ...prev, run: false }));
    }
  };

  const renderField = (key: string, prop: any) => {
    if (key === "proxy") {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={key}
            checked={!!formData[key]}
            onCheckedChange={(c) => handleInputChange(key, c)}
          />
          <label htmlFor={key}>Use Apify Proxy</label>
        </div>
      );
    }

    switch (prop.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={key}
              checked={!!formData[key]}
              onCheckedChange={(c) => handleInputChange(key, c)}
            />
            <label htmlFor={key}>Enable</label>
          </div>
        );
      case "integer":
        return (
          <Input
            id={key}
            type="number"
            value={formData[key] || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
        );
      case "array":
        return (
          <Textarea
            id={key}
            placeholder="Enter one value per line..."
            value={formData[key] || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
        );
      default:
        return (
          <Input
            id={key}
            value={formData[key] || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-8 my-8">
      <Card>
        <CardHeader>
          <CardTitle>1. Select Actor</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading.actors ? (
            <p>Loading actors...</p>
          ) : (
            <Select onValueChange={handleActorSelect} value={selectedActorName}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an actor..." />
              </SelectTrigger>
              <SelectContent>
                {actors.map((actor) => (
                  <SelectItem
                    key={actor.id}
                    value={`${actor.username}/${actor.name}`}
                  >
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {isLoading.schema && (
        <div className="text-center">
          <Loader2 className="inline-block animate-spin" /> Loading Schema...
        </div>
      )}

      {actorSchema?.properties && (
        <Card>
          <CardHeader>
            <CardTitle>2. Provide Input</CardTitle>
          </CardHeader>
          <form onSubmit={handleRunActor}>
            <CardContent className="space-y-4">
              {Object.entries(actorSchema.properties).map(
                ([key, prop]: [string, any]) => {
                  const descriptionHtml = { __html: prop.description || "" };
                  return (
                    <div key={key}>
                      <Label htmlFor={key} className="text-lg">
                        {prop.title || key}
                      </Label>
                      <p
                        className="text-sm text-muted-foreground mb-2"
                        dangerouslySetInnerHTML={descriptionHtml}
                      />
                      {renderField(key, prop)}
                    </div>
                  );
                }
              )}
              <Button
                type="submit"
                className="w-full !mt-6"
                disabled={isLoading.run}
              >
                {isLoading.run && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Run Actor
              </Button>
            </CardContent>
          </form>
        </Card>
      )}

      {isLoading.run && (
        <div className="text-center">
          <Loader2 className="inline-block animate-spin" /> Running Actor...
        </div>
      )}

      {runResult && <ResultsDisplay results={runResult} />}
    </div>
  );
}
