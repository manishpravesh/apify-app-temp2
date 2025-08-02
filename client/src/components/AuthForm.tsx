import { useState } from "react";
import { apiClient, setAuthToken } from "@/lib/api"; // Import setAuthToken
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const apiKey = (
      event.currentTarget.elements.namedItem("api-key") as HTMLInputElement
    ).value;

    try {
      // Set the token for future requests *before* verifying it
      setAuthToken(apiKey);
      // The body is now empty as the key is in the header
      await apiClient.post("/verify-key", {});
      toast.success("API Key Verified!");
      onSuccess();
    } catch (err: any) {
      // Clear the token if authentication fails
      setAuthToken(null);
      toast.error(err.response?.data?.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full pt-20">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Connect to Apify</CardTitle>
          <CardDescription>Enter your API key to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                name="api-key"
                type="password"
                required
                placeholder="apify_api_..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
