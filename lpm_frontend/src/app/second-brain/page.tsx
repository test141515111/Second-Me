'use client';

import { useState, useEffect } from 'react';
import SecondBrainVisualizer from '@/components/SecondBrain/SecondBrainVisualizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SecondBrainPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);

  useEffect(() => {
    // Simulate loading knowledge graph data
    const loadData = async () => {
      try {
        // In a real implementation, this would fetch data from the backend
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading knowledge graph:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    // In a real implementation, this would fetch node details from the backend
    setNodeDetails({
      id: nodeId,
      name: `Node ${nodeId.split('-')[1]}`,
      type: ['topic', 'entity', 'document'][Math.floor(Math.random() * 3)],
      connections: Math.floor(Math.random() * 5) + 1,
      lastUpdated: new Date().toLocaleDateString()
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Second Brain</h1>
      
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="visualization">Knowledge Graph</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualization" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading your Second Brain...</p>
                  </div>
                </div>
              ) : (
                <SecondBrainVisualizer 
                  onNodeClick={handleNodeClick}
                  onInitialized={() => console.log('Visualization initialized')}
                />
              )}
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Node Details</CardTitle>
                  <CardDescription>
                    {selectedNode 
                      ? `Viewing details for ${nodeDetails?.name}` 
                      : 'Select a node to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedNode ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</h3>
                        <p>{nodeDetails?.id}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                        <p>{nodeDetails?.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                        <p className="capitalize">{nodeDetails?.type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Connections</h3>
                        <p>{nodeDetails?.connections}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                        <p>{nodeDetails?.lastUpdated}</p>
                      </div>
                      <div className="pt-4">
                        <Button variant="outline" className="mr-2">View Content</Button>
                        <Button>Explore Connections</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>Click on a node in the visualization to view its details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle>Second Brain Management</CardTitle>
              <CardDescription>
                Manage your knowledge graph, add new content, and optimize your Second Brain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button className="w-full py-8 flex flex-col items-center justify-center h-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add New Content</span>
                </Button>
                
                <Button variant="outline" className="w-full py-8 flex flex-col items-center justify-center h-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Rebuild Knowledge Graph</span>
                </Button>
                
                <Button variant="outline" className="w-full py-8 flex flex-col items-center justify-center h-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Export Knowledge</span>
                </Button>
                
                <Button variant="outline" className="w-full py-8 flex flex-col items-center justify-center h-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
