'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ArrowRight, Key, Database, Brain, CheckCircle2, RotateCcw, Search, Plus, Info } from 'lucide-react';

interface CacheEntry {
  key: string;
  value: string;
}

interface Cache {
  [key: string]: CacheEntry;
}

interface TooltipContent {
  title: string;
  description: string;
}

const tooltips: Record<string, TooltipContent> = {
  cache: {
    title: "KV Cache",
    description: "The KV cache stores transformed representations of tokens that have been processed. This avoids recomputing these transformations when the same tokens appear again or when generating new tokens."
  },
  keys: {
    title: "Keys (K)",
    description: "Keys are high-dimensional vectors (not single values like shown here). Each token is transformed through the model's key projection matrices. Keys are used in attention calculations to determine relevance of past tokens."
  },
  values: {
    title: "Values (V)",
    description: "Values are also high-dimensional vectors containing transformed token information. When attention determines a past token is relevant, its value vector contributes to the next token prediction."
  },
  cacheHit: {
    title: "Cache Hit",
    description: "When we see a token we've processed before, we can reuse its cached K,V pairs instead of recomputing them. This saves computation and is a key optimization in LLM inference."
  },
  generation: {
    title: "Generation Process",
    description: "During generation, the model uses all cached K,V pairs as context to predict the next token. Each new token's K,V pairs are also cached for future predictions."
  }
};

const KVCacheDemo = () => {
  const [step, setStep] = useState(0);
  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  const [cache, setCache] = useState<Cache>({});
  const [generating, setGenerating] = useState(false);
  const [cacheHit, setCacheHit] = useState(false);
  const [computingNew, setComputingNew] = useState(false);
  const [activeTokens, setActiveTokens] = useState<string[]>([]);
  const [highlightedCacheItems, setHighlightedCacheItems] = useState<string[]>([]);

  const steps = [
    {
      title: "Initial State",
      description: "We start with an input sequence: 'The cat sat on the mat'",
      action: "Next: Process first token"
    },
    {
      title: "Process First Token",
      description: "Generate K,V pair for 'The' and store in cache",
      action: "Next: Process second token"
    },
    {
      title: "Process Second Token", 
      description: "Generate K,V pair for 'cat' and store in cache",
      action: "Next: Process third token"
    },
    {
      title: "Process Third Token",
      description: "Generate K,V pair for 'sat' and store in cache",
      action: "Next: Process fourth token"
    },
    {
      title: "Process Fourth Token",
      description: "Generate K,V pair for 'on' and store in cache",
      action: "Next: Process fifth token"
    },
    {
      title: "Process Fifth Token - Cache Hit!",
      description: "We've seen 'the' before! We can reuse its existing K,V pair instead of recomputing",
      action: "Next: Process sixth token"
    },
    {
      title: "Process Sixth Token",
      description: "Generate K,V pair for 'mat' and store in cache",
      action: "Next: Begin generation"
    },
    {
      title: "Generate First New Token",
      description: "'and' isn't in our cache, so we need to compute new K,V pairs while using the cached context",
      action: "Next: Generate second token"
    },
    {
      title: "Generate Second Token - Cache Hit!",
      description: "Generating 'the' - we can reuse its K,V pair from the cache during generation",
      action: "Start Over"
    }
  ];

  const handleNext = () => {
    if (step === steps.length - 1) {
      // Reset everything
      setStep(0);
      setCache({});
      setGenerating(false);
      setCacheHit(false);
      setComputingNew(false);
      setActiveTokens([]);
      setHighlightedCacheItems([]);
    } else {
      // Processing input tokens
      if (step < 6) {
        const token = tokens[step];
        const lowerToken = token.toLowerCase();
        
        if (lowerToken === 'the' && cache['the']) {
          setCacheHit(true);
          setComputingNew(false);
          setHighlightedCacheItems(['the']);
        } else {
          setCacheHit(false);
          setComputingNew(true);
          setHighlightedCacheItems([]);
          setCache(prev => ({
            ...prev,
            [lowerToken]: {
              key: `k${Object.keys(prev).length}`,
              value: `v${Object.keys(prev).length}`
            }
          }));
        }
      }
      // Entering generation phase
      else if (step === 6) {
        setGenerating(true);
        setActiveTokens(tokens);
        setHighlightedCacheItems(Object.keys(cache));
        // Pre-add 'and' to the cache for the next step
        setCache(prev => ({
          ...prev,
          'and': {
            key: `k${Object.keys(prev).length}`,
            value: `v${Object.keys(prev).length}`
          }
        }));
      }
      // Generating 'and' - computing new K,V pairs
      else if (step === 7) {
        setCacheHit(false);
        setComputingNew(true);
        setHighlightedCacheItems(['and', ...Object.keys(cache).filter(t => t !== 'and')]);
      }
      // Generating 'the' - cache hit
      else if (step === 8) {
        setCacheHit(true);
        setComputingNew(false);
        setHighlightedCacheItems(['the', 'and']);
      }
      
      setStep(prev => prev + 1);
    }
  };

  const getCurrentGeneratedTokens = () => {
    if (step === 7) return ['and'];
    if (step === 8) return ['and', 'the'];
    return [];
  };

  const renderTooltip = (content: TooltipContent, children: React.ReactNode) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="inline-flex items-center cursor-help">
          {children}
          <Info size={14} className="ml-1 text-gray-400" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-[450px]">
        <h4 className="font-semibold mb-1">{content.title}</h4>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>KV Cache Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step indicator */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold">{steps[step].title}</h3>
            <p className="text-gray-600">{steps[step].description}</p>
          </div>

          {/* Visualization area */}
          <div className="flex flex-col gap-8 mb-8">
            {/* Input tokens */}
            <div className="flex gap-4 items-center">
              <span className="font-mono">Input:</span>
              <div className="flex gap-2">
                {tokens.map((token, idx) => (
                  <div 
                    key={idx}
                    className={`p-2 border rounded ${
                      activeTokens.includes(token) ? 'bg-blue-50' : ''
                    } ${token.toLowerCase() === 'the' && step === 4 && cacheHit ? 'bg-green-100 border-green-500' : ''} 
                    ${(step > idx && !generating) || (step === 4 && idx < 4) ? 'bg-blue-100' : ''}`}
                  >
                    {token}
                    {token.toLowerCase() === 'the' && step === 4 && cacheHit && (
                      <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                        <CheckCircle2 size={14} />
                        <span>Cache hit!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generation tokens */}
            {generating && (
              <div className="flex gap-4 items-center">
                {renderTooltip(tooltips.generation, 
                  <span className="font-mono">Generated:</span>
                )}
                <div className="flex gap-2">
                  {getCurrentGeneratedTokens().map((token, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 border rounded ${
                        step === idx + 7 && computingNew ? 'bg-yellow-100 border-yellow-500' : ''
                      } ${step === idx + 7 && cacheHit ? 'bg-green-100 border-green-500' : ''} 
                      ${step < idx + 7 ? 'bg-gray-50' : 'bg-blue-100'}`}
                    >
                      {token}
                      {step === idx + 7 && computingNew && (
                        <div className="flex items-center gap-1 text-yellow-600 text-sm mt-1">
                          <Plus size={14} />
                          <span>Computing new K,V</span>
                        </div>
                      )}
                      {step === idx + 7 && cacheHit && (
                        <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                          <CheckCircle2 size={14} />
                          <span>Cache hit!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cache visualization */}
            <div className="flex gap-4 items-start">
              {renderTooltip(tooltips.cache,
                <span className="font-mono mt-2">Cache:</span>
              )}
              <div className="flex-1 border rounded-lg p-4 bg-gray-50">
                {Object.entries(cache).map(([token, kv], idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-4 items-center mb-2 p-2 rounded ${
                      highlightedCacheItems.includes(token) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="font-mono w-16">{token}:</span>
                    <div className="flex gap-2">
                      {renderTooltip(tooltips.keys,
                        <div className="flex items-center gap-1 bg-blue-100 p-2 rounded">
                          <Key size={16} />
                          <span>{kv.key}</span>
                        </div>
                      )}
                      {renderTooltip(tooltips.values,
                        <div className="flex items-center gap-1 bg-purple-100 p-2 rounded">
                          <Database size={16} />
                          <span>{kv.value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {Object.keys(cache).length === 0 && (
                  <div className="text-gray-500 italic">Empty cache</div>
                )}
              </div>
            </div>

            {/* Process visualization */}
            {generating && (
              <div className="flex gap-4 items-center">
                {renderTooltip(tooltips.generation,
                  <span className="font-mono">Process:</span>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex gap-2 items-center bg-gray-100 p-2 rounded">
                    {step === 7 ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Brain size={16} />
                            <span>Using cached context to predict "and"</span>
                          </div>
                          <ArrowRight size={16} />
                          <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>Computing new K,V pair for "and"</span>
                          </div>
                        </div>
                      </>
                    ) : step === 8 ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Brain size={16} />
                            <span>Using cached context to predict "the"</span>
                          </div>
                          <ArrowRight size={16} />
                          <div className="flex items-center gap-2">
                            <Search size={16} />
                            <span>Reusing cached K,V pair for "the"</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Brain size={16} />
                        <span>Using cached K,V pairs as context</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Step {step + 1} of {steps.length}
            </div>
            <Button onClick={handleNext} className="flex items-center gap-2">
              {step === steps.length - 1 && <RotateCcw size={16} />}
              {steps[step].action}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KVCacheDemo;
