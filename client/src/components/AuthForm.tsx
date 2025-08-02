import { useState } from "react";
import { apiClient, setAuthToken } from "@/lib/api";
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
      setAuthToken(apiKey);
      await apiClient.post("/verify-key", {});
      toast.success("API Key Verified!");
      onSuccess();
    } catch (err: any) {
      setAuthToken(null);
      toast.error(err.response?.data?.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✨ UI UPGRADE: The parent div now centers the card vertically in the viewport
    <div className="flex items-center justify-center h-full w-full">
      {/* - `w-full max-w-lg`: Makes the card noticeably larger.
          - `bg-white/20 dark:bg-black/20`: Increases transparency for a more pronounced glass effect.
          - `backdrop-blur-xl`: Increases the blur intensity.
          - `border-white/30`: Makes the border slightly more visible.
        */}
      <Card className="w-full max-w-lg bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Connect to Apify</CardTitle>
          <CardDescription className="text-lg">
            Enter your API key to unlock the Actor Runner.
          </CardDescription>
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
                className="py-6 text-lg" // Larger text input
              />
            </div>
            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Connect Securely
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
