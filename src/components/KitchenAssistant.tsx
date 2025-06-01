
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Timer, Calculator, Thermometer, Scale, Play, Pause, RotateCcw, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TimerState {
  id: string;
  name: string;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
}

const KitchenAssistant = () => {
  const [timers, setTimers] = useState<TimerState[]>([]);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState(0);
  const [newTimerSeconds, setNewTimerSeconds] = useState(0);
  
  // Unit conversion states
  const [convertValue, setConvertValue] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [conversionResult, setConversionResult] = useState("");
  
  // Temperature conversion
  const [tempValue, setTempValue] = useState("");
  const [tempFromUnit, setTempFromUnit] = useState("celsius");
  const [tempResult, setTempResult] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isRunning && timer.totalSeconds > 0) {
            const newTotalSeconds = timer.totalSeconds - 1;
            const minutes = Math.floor(newTotalSeconds / 60);
            const seconds = newTotalSeconds % 60;
            
            if (newTotalSeconds === 0) {
              toast({
                title: "Timer Finished!",
                description: `${timer.name} is done!`,
              });
              return { ...timer, minutes: 0, seconds: 0, totalSeconds: 0, isRunning: false, isFinished: true };
            }
            
            return { ...timer, minutes, seconds, totalSeconds: newTotalSeconds };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTimer = () => {
    if (!newTimerName.trim()) {
      toast({
        title: "Timer name required",
        description: "Please enter a name for your timer.",
        variant: "destructive"
      });
      return;
    }

    const totalSeconds = (newTimerMinutes * 60) + newTimerSeconds;
    if (totalSeconds === 0) {
      toast({
        title: "Invalid timer duration",
        description: "Please set a timer duration greater than 0.",
        variant: "destructive"
      });
      return;
    }

    const newTimer: TimerState = {
      id: Date.now().toString(),
      name: newTimerName,
      minutes: newTimerMinutes,
      seconds: newTimerSeconds,
      totalSeconds,
      isRunning: false,
      isFinished: false
    };

    setTimers(prev => [...prev, newTimer]);
    setNewTimerName("");
    setNewTimerMinutes(0);
    setNewTimerSeconds(0);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isRunning: !timer.isRunning, isFinished: false }
          : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { 
              ...timer, 
              minutes: Math.floor(timer.totalSeconds / 60), 
              seconds: timer.totalSeconds % 60,
              isRunning: false,
              isFinished: false,
              totalSeconds: timer.totalSeconds
            }
          : timer
      )
    );
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Conversion functions
  const unitConversions = {
    // Volume conversions (all to ml)
    ml: 1,
    l: 1000,
    cup: 240,
    tbsp: 15,
    tsp: 5,
    'fl oz': 30,
    pint: 473,
    quart: 946,
    gallon: 3785,
    
    // Weight conversions (all to grams)
    g: 1,
    kg: 1000,
    oz: 28.35,
    lb: 453.59,
    
    // Length conversions (all to cm)
    mm: 0.1,
    cm: 1,
    m: 100,
    inch: 2.54,
    ft: 30.48
  };

  const convertUnits = () => {
    const value = parseFloat(convertValue);
    if (isNaN(value) || !fromUnit || !toUnit) {
      setConversionResult("Please enter valid values");
      return;
    }

    const fromMultiplier = unitConversions[fromUnit as keyof typeof unitConversions];
    const toMultiplier = unitConversions[toUnit as keyof typeof unitConversions];

    if (!fromMultiplier || !toMultiplier) {
      setConversionResult("Invalid unit selection");
      return;
    }

    // Check if units are compatible (same category)
    const volumeUnits = ['ml', 'l', 'cup', 'tbsp', 'tsp', 'fl oz', 'pint', 'quart', 'gallon'];
    const weightUnits = ['g', 'kg', 'oz', 'lb'];
    const lengthUnits = ['mm', 'cm', 'm', 'inch', 'ft'];

    const fromCategory = volumeUnits.includes(fromUnit) ? 'volume' : 
                        weightUnits.includes(fromUnit) ? 'weight' : 'length';
    const toCategory = volumeUnits.includes(toUnit) ? 'volume' : 
                      weightUnits.includes(toUnit) ? 'weight' : 'length';

    if (fromCategory !== toCategory) {
      setConversionResult("Cannot convert between different measurement types");
      return;
    }

    const result = (value * fromMultiplier) / toMultiplier;
    setConversionResult(`${result.toFixed(3)} ${toUnit}`);
  };

  const convertTemperature = () => {
    const value = parseFloat(tempValue);
    if (isNaN(value)) {
      setTempResult("Please enter a valid temperature");
      return;
    }

    let celsius = value;
    if (tempFromUnit === 'fahrenheit') {
      celsius = (value - 32) * 5/9;
    } else if (tempFromUnit === 'kelvin') {
      celsius = value - 273.15;
    }

    const fahrenheit = (celsius * 9/5) + 32;
    const kelvin = celsius + 273.15;

    setTempResult(`${celsius.toFixed(1)}°C | ${fahrenheit.toFixed(1)}°F | ${kelvin.toFixed(1)}K`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Kitchen Assistant
          </CardTitle>
          <CardDescription>
            Your comprehensive cooking companion with timers, conversions, and helpful tools
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="timers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timers">Timers</TabsTrigger>
          <TabsTrigger value="conversions">Unit Converter</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
        </TabsList>

        <TabsContent value="timers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="timer-name">Timer Name</Label>
                  <Input
                    id="timer-name"
                    placeholder="e.g., Pasta, Oven..."
                    value={newTimerName}
                    onChange={(e) => setNewTimerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="999"
                    value={newTimerMinutes}
                    onChange={(e) => setNewTimerMinutes(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="seconds">Seconds</Label>
                  <Input
                    id="seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={newTimerSeconds}
                    onChange={(e) => setNewTimerSeconds(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addTimer} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Timer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timers.map((timer) => (
              <Card key={timer.id} className={timer.isFinished ? "border-green-500" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{timer.name}</CardTitle>
                  <div className="text-3xl font-mono text-center">
                    {formatTime(timer.minutes, timer.seconds)}
                  </div>
                  {timer.isFinished && (
                    <Badge className="self-center">Finished!</Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={timer.isRunning ? "secondary" : "default"}
                      onClick={() => toggleTimer(timer.id)}
                      className="flex-1"
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
                      variant="destructive"
                      onClick={() => removeTimer(timer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {timers.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No timers set. Add a timer to get started!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Unit Converter
              </CardTitle>
              <CardDescription>Convert between cooking measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="convert-value">Value</Label>
                  <Input
                    id="convert-value"
                    type="number"
                    placeholder="Enter amount"
                    value={convertValue}
                    onChange={(e) => setConvertValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="from-unit">From Unit</Label>
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      <SelectItem value="l">Liters (l)</SelectItem>
                      <SelectItem value="cup">Cups</SelectItem>
                      <SelectItem value="tbsp">Tablespoons</SelectItem>
                      <SelectItem value="tsp">Teaspoons</SelectItem>
                      <SelectItem value="fl oz">Fluid Ounces</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="to-unit">To Unit</Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      <SelectItem value="l">Liters (l)</SelectItem>
                      <SelectItem value="cup">Cups</SelectItem>
                      <SelectItem value="tbsp">Tablespoons</SelectItem>
                      <SelectItem value="tsp">Teaspoons</SelectItem>
                      <SelectItem value="fl oz">Fluid Ounces</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={convertUnits} className="w-full">
                Convert
              </Button>
              
              {conversionResult && (
                <div className="p-4 bg-muted rounded-lg">
                  <Label>Result:</Label>
                  <p className="text-lg font-semibold">{conversionResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temperature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Temperature Converter
              </CardTitle>
              <CardDescription>Convert between Celsius, Fahrenheit, and Kelvin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temp-value">Temperature</Label>
                  <Input
                    id="temp-value"
                    type="number"
                    placeholder="Enter temperature"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="temp-from">From Unit</Label>
                  <Select value={tempFromUnit} onValueChange={setTempFromUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      <SelectItem value="kelvin">Kelvin (K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={convertTemperature} className="w-full">
                Convert Temperature
              </Button>
              
              {tempResult && (
                <div className="p-4 bg-muted rounded-lg">
                  <Label>Result:</Label>
                  <p className="text-lg font-semibold">{tempResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KitchenAssistant;
