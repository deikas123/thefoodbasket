
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, RotateCcw, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  category: string;
}

interface ActiveTimer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  startTime: number;
}

const PRESET_TIMERS: Timer[] = [
  // Dairy
  { id: 'milk-heat', name: 'Heat Milk', duration: 300, category: 'Dairy' }, // 5 minutes
  { id: 'milk-boil', name: 'Boil Milk', duration: 180, category: 'Dairy' }, // 3 minutes
  
  // Eggs
  { id: 'soft-boiled-egg', name: 'Soft Boiled Egg', duration: 240, category: 'Eggs' }, // 4 minutes
  { id: 'hard-boiled-egg', name: 'Hard Boiled Egg', duration: 600, category: 'Eggs' }, // 10 minutes
  { id: 'scrambled-eggs', name: 'Scrambled Eggs', duration: 180, category: 'Eggs' }, // 3 minutes
  
  // Rice & Grains
  { id: 'white-rice', name: 'White Rice', duration: 1200, category: 'Rice & Grains' }, // 20 minutes
  { id: 'brown-rice', name: 'Brown Rice', duration: 2700, category: 'Rice & Grains' }, // 45 minutes
  { id: 'pasta', name: 'Pasta', duration: 480, category: 'Rice & Grains' }, // 8 minutes
  
  // Vegetables
  { id: 'steam-vegetables', name: 'Steam Vegetables', duration: 600, category: 'Vegetables' }, // 10 minutes
  { id: 'roast-vegetables', name: 'Roast Vegetables', duration: 1800, category: 'Vegetables' }, // 30 minutes
  
  // Meat
  { id: 'chicken-breast', name: 'Chicken Breast', duration: 1500, category: 'Meat' }, // 25 minutes
  { id: 'ground-beef', name: 'Ground Beef', duration: 900, category: 'Meat' }, // 15 minutes
  
  // Baking
  { id: 'cookies', name: 'Cookies', duration: 720, category: 'Baking' }, // 12 minutes
  { id: 'bread', name: 'Bread', duration: 1800, category: 'Baking' }, // 30 minutes
];

const MealTimer: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [selectedTimer, setSelectedTimer] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const { toast } = useToast();

  // Initialize audio context
  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    
    return () => {
      context.close();
    };
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [audioContext]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notification
  const showNotification = useCallback((timerName: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Timer Complete!`, {
        body: `${timerName} is ready!`,
        icon: '/favicon.ico',
        tag: 'timer-notification'
      });
    }
  }, []);

  // Timer update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => 
        prev.map(timer => {
          if (!timer.isRunning) return timer;
          
          const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
          const remaining = Math.max(0, timer.duration - elapsed);
          
          if (remaining === 0 && timer.remaining > 0) {
            // Timer completed
            playNotificationSound();
            showNotification(timer.name);
            toast({
              title: "Timer Complete!",
              description: `${timer.name} is ready!`,
              className: "timer-notification"
            });
            
            return { ...timer, remaining: 0, isRunning: false };
          }
          
          return { ...timer, remaining };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [playNotificationSound, showNotification, toast]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const addTimer = (timerId: string, customDuration?: number) => {
    const preset = PRESET_TIMERS.find(t => t.id === timerId);
    if (!preset && !customDuration) return;
    
    const duration = customDuration || preset!.duration;
    const name = preset?.name || 'Custom Timer';
    
    const newTimer: ActiveTimer = {
      id: `${timerId}-${Date.now()}`,
      name,
      duration,
      remaining: duration,
      isRunning: false,
      startTime: Date.now()
    };
    
    setActiveTimers(prev => [...prev, newTimer]);
  };

  const addCustomTimer = () => {
    const minutes = parseInt(customTime);
    if (isNaN(minutes) || minutes <= 0) return;
    
    addTimer('custom', minutes * 60);
    setCustomTime('');
  };

  const toggleTimer = (id: string) => {
    setActiveTimers(prev =>
      prev.map(timer => {
        if (timer.id !== id) return timer;
        
        if (timer.isRunning) {
          return { ...timer, isRunning: false };
        } else {
          const elapsed = timer.duration - timer.remaining;
          return {
            ...timer,
            isRunning: true,
            startTime: Date.now() - (elapsed * 1000)
          };
        }
      })
    );
  };

  const resetTimer = (id: string) => {
    setActiveTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? { ...timer, remaining: timer.duration, isRunning: false, startTime: Date.now() }
          : timer
      )
    );
  };

  const removeTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const categories = [...new Set(PRESET_TIMERS.map(t => t.category))];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="grocery-gradient text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Meal Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Add Timer Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Preset Timers</label>
              <div className="flex gap-2">
                <Select value={selectedTimer} onValueChange={setSelectedTimer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preset timer" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <div key={category}>
                        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {PRESET_TIMERS.filter(t => t.category === category).map(timer => (
                          <SelectItem key={timer.id} value={timer.id}>
                            {timer.name} ({formatTime(timer.duration)})
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => selectedTimer && addTimer(selectedTimer)}
                  disabled={!selectedTimer}
                  className="bg-grocery-500 hover:bg-grocery-600"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Timer (minutes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="Enter minutes"
                  className="flex-1 px-3 py-2 border border-input rounded-md"
                  min="1"
                />
                <Button 
                  onClick={addCustomTimer}
                  disabled={!customTime}
                  className="bg-fresh-500 hover:bg-fresh-600"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Active Timers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Active Timers</h3>
            {activeTimers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active timers. Add one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTimers.map(timer => (
                  <Card key={timer.id} className={`${timer.remaining === 0 ? 'border-grocery-500 bg-grocery-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{timer.name}</h4>
                          {timer.remaining === 0 && (
                            <Badge className="bg-grocery-500 animate-bounce">
                              <Bell className="h-3 w-3 mr-1" />
                              Done!
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-3xl font-mono ${timer.remaining === 0 ? 'text-grocery-600' : 'text-primary'}`}>
                            {formatTime(timer.remaining)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            of {formatTime(timer.duration)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleTimer(timer.id)}
                            disabled={timer.remaining === 0}
                          >
                            {timer.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetTimer(timer.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeTimer(timer.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealTimer;
