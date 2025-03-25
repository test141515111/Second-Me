'use client';

import { useState, useEffect } from 'react';
import VibeCodingEditor from '@/components/VibeCoding/VibeCodingEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function VibeCodingPage() {
  const [code, setCode] = useState<string>('// Write your code here');
  const [language, setLanguage] = useState<string>('javascript');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string>('');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleAnalyzeCode = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the backend API
      const response = await fetch('/api/vibecoding/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code_samples: [code],
          preferred_language: 'English',
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setAnalysis(data.data.analysis);
      } else {
        setAnalysis('Error analyzing code: ' + data.message);
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      setAnalysis('Error analyzing code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSuggestion = async () => {
    if (!taskDescription) {
      alert('Please enter a task description');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the backend API
      const response = await fetch('/api/vibecoding/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_description: taskDescription,
          context: code,
          preferred_language: 'English',
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSuggestion(data.data.suggestion);
      } else {
        setSuggestion('Error generating suggestion: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setSuggestion('Error generating suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      setCode(suggestion);
      setSuggestion('');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Vibe Coding</h1>
      
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Code Editor</TabsTrigger>
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="analysis">Style Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="w-full">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
                <CardDescription>
                  Write and edit your code in your personal style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <VibeCodingEditor 
                  initialCode={code}
                  language={language}
                  onCodeChange={handleCodeChange}
                  height="500px"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assistant" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Description</CardTitle>
                <CardDescription>
                  Describe what you want to accomplish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Describe your coding task here..."
                  className="min-h-[200px]"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
                <Button 
                  className="mt-4 w-full"
                  onClick={handleGenerateSuggestion}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Code Suggestion'}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Code Suggestion</CardTitle>
                <CardDescription>
                  AI-generated code based on your style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md min-h-[200px] mb-4 overflow-auto">
                  <pre className="whitespace-pre-wrap">
                    {suggestion || 'Your code suggestion will appear here'}
                  </pre>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleApplySuggestion}
                  disabled={!suggestion}
                >
                  Apply Suggestion to Editor
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Coding Style Analysis</CardTitle>
              <CardDescription>
                Analyze your coding style and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="mb-4"
                onClick={handleAnalyzeCode}
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Current Code'}
              </Button>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md min-h-[300px] overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {analysis || 'Your code analysis will appear here after you click "Analyze Current Code"'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
