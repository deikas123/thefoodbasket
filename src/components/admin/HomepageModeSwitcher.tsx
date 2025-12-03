import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Home, Clock, Wrench, Sparkles, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getHomepageMode, setHomepageMode, HomepageMode } from "@/services/contentService";
import { cn } from "@/lib/utils";

const modes = [
  {
    id: 'home' as HomepageMode,
    title: 'Normal Homepage',
    description: 'Show the regular homepage with products and categories',
    icon: Home,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  },
  {
    id: 'waitlist' as HomepageMode,
    title: 'Waitlist Page',
    description: 'Show a waitlist/coming soon page to collect signups',
    icon: Clock,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 'maintenance' as HomepageMode,
    title: 'Maintenance Page',
    description: 'Display maintenance notice while doing updates',
    icon: Wrench,
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
  },
  {
    id: 'promo' as HomepageMode,
    title: 'Promotional Page',
    description: 'Show a special promotional landing page',
    icon: Sparkles,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
  }
];

const HomepageModeSwitcher = () => {
  const queryClient = useQueryClient();
  const [selectedMode, setSelectedMode] = useState<HomepageMode>('home');

  const { data: currentMode, isLoading } = useQuery({
    queryKey: ['homepageMode'],
    queryFn: getHomepageMode
  });

  const mutation = useMutation({
    mutationFn: setHomepageMode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageMode'] });
    }
  });

  useEffect(() => {
    if (currentMode) {
      setSelectedMode(currentMode);
    }
  }, [currentMode]);

  const handleSave = () => {
    mutation.mutate(selectedMode);
  };

  const hasChanges = currentMode !== selectedMode;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Homepage Mode
        </CardTitle>
        <CardDescription>
          Choose which page visitors see when they visit your store
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <RadioGroup
              value={selectedMode}
              onValueChange={(value) => setSelectedMode(value as HomepageMode)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {modes.map((mode) => (
                <div key={mode.id}>
                  <RadioGroupItem
                    value={mode.id}
                    id={mode.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={mode.id}
                    className={cn(
                      "flex items-start gap-4 rounded-xl border-2 border-border p-4 cursor-pointer transition-all",
                      "hover:bg-accent/50",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg shrink-0", mode.color)}>
                      <mode.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mode.title}</span>
                        {currentMode === mode.id && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mode.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || mutation.isPending}
                className="gap-2"
              >
                {mutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HomepageModeSwitcher;
