'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ArrowRight, Key, Database, Brain, CheckCircle2, RotateCcw, Plus, Info } from 'lucide-react';

interface CacheEntry {
  key: string;
  value: string;
  isHighlighted: boolean;
}

interface TraditionalCache {
  [token: string]: CacheEntry;
}

interface Token {
  text: string;
  isHighlighted: boolean;
  isCacheHit: boolean;
  isProcessed: boolean;
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
    title: "Generation Process (Traditional Cache)",
    description: "During generation, the model uses all cached K,V pairs as context to predict the next token. Each new token's K,V pairs are also cached for future predictions. In traditional caching, all past tokens remain available in GPU memory."
  },
  pagedGeneration: {
    title: "Generation Process (Paged Cache)",
    description: "During generation with paged attention, the model primarily uses K,V pairs from active (GPU-resident) pages to predict the next token. While older pages can be accessed, they may require swapping from CPU memory, so the model prioritizes recent context for efficiency."
  },
  pagedCache: {
    title: "Paged KV Cache",
    description: "Paged attention organizes the KV cache into fixed-size pages. Each page contains a block of tokens. During generation, only the most recent pages are kept in fast GPU memory, while older pages may be swapped to CPU memory."
  },
  pages: {
    title: "Pages",
    description: "Fixed-size memory blocks that store KV pairs for multiple tokens. Pages can be efficiently swapped between GPU and CPU memory. During generation, typically only the most recent pages remain in GPU memory."
  },
  swappedPage: {
    title: "Swapped Page",
    description: "This page has been swapped out to CPU memory. While its tokens can still be referenced, accessing them would require a memory swap operation. Paged attention typically keeps only the most recent context in GPU memory for efficient generation."
  },
  activePage: {
    title: "Active Page",
    description: "This page is currently in GPU memory, allowing fast access to its tokens' KV pairs. During generation, we prioritize keeping the most recent context pages active."
  },
  generationContext: {
    title: "Generation Context",
    description: "When generating new tokens, paged attention primarily uses the KV pairs from active (GPU-resident) pages. While older pages can be accessed, it's more efficient to work with the most recent context."
  }
};

interface PageBlock {
  token: string;
  key: string;
  value: string;
}

interface Page {
  blocks: (PageBlock | null)[];
  isActive: boolean;
}

const PAGE_SIZE = 4; // Number of blocks per page

const KVCacheDemo = () => {
  const [step, setStep] = useState(0);
  const inputTokens = ['The', 'black', 'cat', 'sat', 'on', 'the', 'mat'].map(text => ({
    text,
    isHighlighted: false,
    isCacheHit: false,
    isProcessed: false
  }));
  const generatedTokens = ['and', 'the'].map(text => ({
    text,
    isHighlighted: false,
    isCacheHit: false,
    isProcessed: false
  }));
  const [tokens, setTokens] = useState<Token[]>(inputTokens);
  const [genTokens, setGenTokens] = useState<Token[]>(generatedTokens);
  const [cache, setCache] = useState<TraditionalCache>({});
  const [generating, setGenerating] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);

  // Calculate key phases of the demo
  const processingPhaseEndStep = tokens.length;  // Step after processing all input tokens
  const generationStartStep = processingPhaseEndStep;  // Step when we start generation
  const firstGenerationStep = generationStartStep + 1;  // First step of actual generation
  const secondGenerationStep = firstGenerationStep + 1;  // Second step of generation
  const totalSteps = secondGenerationStep + 1;  // Total number of steps in the demo

  // Helper function to get ordinal numbers (1st, 2nd, 3rd, etc.)
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const steps = [
    {
      title: "Initial State",
      description: "We start with an input sequence: 'The black cat sat on the mat'",
      action: "Next: Process first token"
    },
    ...Array(processingPhaseEndStep - 1).fill(null).map((_, idx) => {
      const token = tokens[idx + 1];
      const isThe = token.text.toLowerCase() === 'the' && idx + 1 > 0;
      return {
        title: `Process ${getOrdinal(idx + 2)} Token${isThe ? " - Cache Hit!" : ""}`,
        description: isThe 
          ? "We've seen 'the' before! We can reuse its existing K,V pair instead of recomputing"
          : `Generate K,V pair for '${token.text}' and store in cache`,
        action: idx + 2 < processingPhaseEndStep 
          ? `Next: Process ${getOrdinal(idx + 3)} token`
          : "Next: Begin generation"
      };
    }),
    {
      title: "Begin Generation Phase",
      description: "Using all cached K,V pairs as context to start generating new tokens",
      action: "Next: Generate first token"
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
    if (step === totalSteps - 1) {
      // Reset everything
      setStep(0);
      setTokens(inputTokens);
      setGenTokens(generatedTokens);
      setCache({});
      setPages([]);
      setGenerating(false);
    } else {
      // Processing input tokens
      if (step < processingPhaseEndStep) {
        const token = tokens[step];
        const lowerToken = token.text.toLowerCase();
        
        // Update tokens to show processing
        setTokens(prev => prev.map((t, idx) => ({
          ...t,
          isProcessed: idx <= step,
          isCacheHit: idx === step && lowerToken === 'the' && Boolean(cache['the']),
          isHighlighted: idx === step
        })));

        // Update cache
        if (lowerToken === 'the' && cache['the']) {
          // Cache hit - highlight existing entry
          setCache(prev => ({
            ...prev,
            'the': { ...prev['the'], isHighlighted: true }
          }));
        } else {
          // New token - add to cache
          const nextIndex = Object.keys(cache).length;
          setCache(prev => ({
            ...prev,
            [lowerToken]: {
              key: `k${nextIndex}`,
              value: `v${nextIndex}`,
              isHighlighted: false
            }
          }));
        }

        // Update paged cache
        const tokenIndex = step;
        const pageIndex = Math.floor(tokenIndex / PAGE_SIZE);
        const blockIndex = tokenIndex % PAGE_SIZE;

        setPages(prev => {
          const newPages = [...prev];
          newPages.forEach(page => page.isActive = false);
          
          if (!newPages[pageIndex]) {
            newPages[pageIndex] = {
              blocks: Array(PAGE_SIZE).fill(null),
              isActive: true
            };
          } else {
            newPages[pageIndex].isActive = true;
          }
          
          const nextIndex = Object.keys(cache).length;
          newPages[pageIndex].blocks[blockIndex] = {
            token: lowerToken,
            key: lowerToken === 'the' && cache['the'] ? 'k0' : `k${nextIndex}`,
            value: lowerToken === 'the' && cache['the'] ? 'v0' : `v${nextIndex}`
          };
          
          return newPages;
        });
      }
      // Generation phase
      else {
        setGenerating(true);
        const genStep = step - processingPhaseEndStep;
        const currentToken = genTokens[genStep];
        const lowerToken = currentToken.text.toLowerCase();

        // Update generated tokens
        setGenTokens(prev => prev.map((t, idx) => ({
          ...t,
          isProcessed: idx <= genStep,
          isCacheHit: idx === genStep && lowerToken in cache,
          isHighlighted: idx === genStep
        })));

        // Update cache highlighting
        setCache(prev => {
          const newCache = { ...prev };
          // Clear all highlights first
          Object.keys(newCache).forEach(key => {
            newCache[key].isHighlighted = false;
          });
          // If token exists in cache, highlight it
          if (lowerToken in newCache) {
            newCache[lowerToken].isHighlighted = true;
          }
          return newCache;
        });

        // Add new token to cache if not a hit
        const nextIndex = Object.keys(cache).length;
        if (!(lowerToken in cache)) {
          setCache(prev => ({
            ...prev,
            [lowerToken]: {
              key: `k${nextIndex}`,
              value: `v${nextIndex}`,
              isHighlighted: false
            }
          }));
        }

        // Update paged cache
        if (step === generationStartStep || step === secondGenerationStep) {
          const tokenIndex = tokens.length + genStep;
          const pageIndex = Math.floor(tokenIndex / PAGE_SIZE);
          const blockIndex = tokenIndex % PAGE_SIZE;

          setPages(prev => {
            const newPages = [...prev];
            newPages.forEach(page => page.isActive = false);
            
            if (!newPages[pageIndex]) {
              newPages[pageIndex] = {
                blocks: Array(PAGE_SIZE).fill(null),
                isActive: true
              };
            } else {
              newPages[pageIndex].isActive = true;
            }
            
            newPages[pageIndex].blocks[blockIndex] = {
              token: currentToken.text,
              key: lowerToken in cache ? 'k0' : `k${nextIndex}`,
              value: lowerToken in cache ? 'v0' : `v${nextIndex}`
            };
            
            return newPages;
          });
        }
      }
      
      setStep(prev => prev + 1);
    }
  };

  const getCurrentGeneratedTokens = () => {
    if (step === firstGenerationStep) return [genTokens[0].text];
    if (step === secondGenerationStep) return [genTokens[0].text, genTokens[1].text];
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

  const renderPagedCache = () => (
    <div className="flex-1 border rounded-lg p-4 bg-gray-50">
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} 
          className={`mb-4 border rounded p-2 ${
            page.isActive 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-100 opacity-75 border-gray-200'
          }`}
        >
          {renderTooltip(
            page.isActive ? tooltips.activePage : tooltips.swappedPage,
            <div className="text-sm font-mono mb-2 text-gray-600 flex items-center gap-2">
              Page {pageIndex}
              {page.isActive ? (
                <span className="text-xs text-blue-600 font-semibold">(Active in GPU)</span>
              ) : (
                <span className="text-xs text-gray-500">(Swapped to CPU)</span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {page.blocks.map((block, blockIndex) => (
              <div key={blockIndex} 
                className={`border rounded p-2 ${
                  page.isActive ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {block ? (
                  <>
                    <div className="font-mono text-sm mb-1">{block.token}</div>
                    <div className="flex gap-1 text-xs">
                      <span className={`px-1 rounded ${
                        page.isActive ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>{block.key}</span>
                      <span className={`px-1 rounded ${
                        page.isActive ? 'bg-purple-100' : 'bg-gray-200'
                      }`}>{block.value}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm text-center">Empty</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {pages.length === 0 && (
        <div className="text-gray-500 italic">Empty cache</div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>KV Cache vs Paged Attention Cache Comparison</CardTitle>
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
                      token.isHighlighted ? 'bg-blue-50' : ''
                    } ${token.text.toLowerCase() === 'the' && step === 4 && token.isCacheHit ? 'bg-green-100 border-green-500' : ''} 
                    ${(step > idx && !generating) || (step === 4 && idx < 4) ? 'bg-blue-100' : ''}`}
                  >
                    {token.text}
                    {token.text.toLowerCase() === 'the' && step === 4 && token.isCacheHit && (
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
                {renderTooltip(tooltips.pagedGeneration, 
                  <span className="font-mono">Generated:</span>
                )}
                <div className="flex gap-2">
                  {getCurrentGeneratedTokens().map((token, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 border rounded ${
                        step === idx + 7 && genTokens[idx + 7].isProcessed ? 'bg-yellow-100 border-yellow-500' : ''
                      } ${step === idx + 7 && genTokens[idx + 7].isCacheHit ? 'bg-green-100 border-green-500' : ''} 
                      ${step < idx + 7 ? 'bg-gray-50' : 'bg-blue-100'}`}
                    >
                      {token}
                      {step === idx + 7 && genTokens[idx + 7].isProcessed && genTokens[idx + 7].text === 'and' && (
                        <div className="flex items-center gap-1 text-yellow-600 text-sm mt-1">
                          <Plus size={14} />
                          <span>Computing new K,V</span>
                        </div>
                      )}
                      {step === idx + 7 && genTokens[idx + 7].isCacheHit && genTokens[idx + 7].text === 'the' && (
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

            {/* Cache visualizations */}
            <div className="grid grid-cols-2 gap-8">
              {/* Traditional KV Cache */}
              <div className="flex gap-4 items-start">
                {renderTooltip(tooltips.cache,
                  <span className="font-mono mt-2">Traditional Cache:</span>
                )}
                <div className="flex-1 border rounded-lg p-4 bg-gray-50">
                  {Object.entries(cache).map(([token, kv], idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-4 items-center mb-2 p-2 rounded ${
                        kv.isHighlighted ? 'bg-blue-50' : ''
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

              {/* Paged Attention Cache */}
              <div className="flex gap-4 items-start">
                {renderTooltip(tooltips.pagedCache,
                  <span className="font-mono mt-2">Paged Cache:</span>
                )}
                {renderPagedCache()}
              </div>
            </div>

            {/* Process visualization */}
            {generating && (
              <div className="flex gap-4 items-center">
                {renderTooltip(tooltips.pagedGeneration,
                  <span className="font-mono">Process:</span>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex gap-2 items-center bg-gray-100 p-2 rounded">
                    {step === generationStartStep ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Brain size={16} />
                            <span>Using cached context to predict &quot;and&quot;</span>
                          </div>
                          <ArrowRight size={16} />
                          <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>Computing new K,V pair for &quot;and&quot;</span>
                          </div>
                        </div>
                      </>
                    ) : step === firstGenerationStep ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Brain size={16} />
                            <span>Using cached context to predict &quot;and&quot;</span>
                          </div>
                          <ArrowRight size={16} />
                          <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>Computing new K,V pair for &quot;and&quot;</span>
                          </div>
                        </div>
                      </>
                    ) : step === secondGenerationStep ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Brain size={16} />
                            <span>Using cached context to predict &quot;the&quot;</span>
                          </div>
                          <ArrowRight size={16} />
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-600" />
                            <span className="text-green-600">Reusing cached K,V pair for &quot;the&quot;</span>
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
              Step {step + 1} of {totalSteps}
            </div>
            <Button onClick={handleNext} className="flex items-center gap-2">
              {step === totalSteps - 1 && <RotateCcw size={16} />}
              {steps[step].action}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KVCacheDemo;
