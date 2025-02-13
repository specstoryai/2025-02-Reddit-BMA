'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ArrowRight, Key, Database, Brain, CheckCircle2, Plus, Info } from 'lucide-react';
import { Header } from '@/components/Header';
import { PaperChatSidebar } from '@/components/PaperChatSidebar';

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
  isHighlighted: boolean;
  isProcessed: boolean;
  isCacheHit: boolean;
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
      action: "Next: Process 'The'"
    },
    ...Array(processingPhaseEndStep - 1).fill(null).map((_, idx) => {
      const nextToken = tokens[idx + 1];
      const isThe = nextToken.text.toLowerCase() === 'the';
      return {
        title: `Process ${getOrdinal(idx + 2)} Token${isThe ? " - Cache Hit!" : ""}`,
        description: isThe 
          ? "We've seen 'the' before! We can reuse its existing K,V pair instead of recomputing"
          : `Generate K,V pair for '${nextToken.text}' and store in cache`,
        action: `Next: Process '${nextToken.text}'`
      };
    }),
    {
      title: "Begin Generation Phase",
      description: "Using all cached K,V pairs as context to start generating new tokens",
      action: `Next: Generate '${genTokens[0].text}'`
    },
    {
      title: "Generate First New Token",
      description: "'and' isn't in our cache, so we need to compute new K,V pairs while using the cached context",
      action: `Next: Generate '${genTokens[1].text}'`
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
        
        // Check for cache hit in active pages only
        let isPagedCacheHit = false;
        let hitPageIndex = -1;
        let hitBlockIndex = -1;

        pages.forEach((page, pageIndex) => {
          if (page.isActive) {
            page.blocks.forEach((block, blockIndex) => {
              if (block && block.token === lowerToken) {
                isPagedCacheHit = true;
                hitPageIndex = pageIndex;
                hitBlockIndex = blockIndex;
              }
            });
          }
        });

        // Update tokens to show processing
        setTokens(prev => prev.map((t, idx) => ({
          ...t,
          isProcessed: idx <= step,
          isCacheHit: idx === step && isPagedCacheHit,
          isHighlighted: idx === step
        })));

        // Update traditional cache
        if (lowerToken === 'the' && cache['the']) {
          setCache(prev => {
            const newCache = { ...prev };
            // Clear all highlights first
            Object.keys(newCache).forEach(key => {
              newCache[key].isHighlighted = false;
            });
            // Set highlight only for current hit
            newCache['the'].isHighlighted = true;
            return newCache;
          });
        } else {
          const nextIndex = Object.keys(cache).length;
          setCache(prev => {
            const newCache = { ...prev };
            // Clear all highlights first
            Object.keys(newCache).forEach(key => {
              newCache[key].isHighlighted = false;
            });
            // Add new token without highlight
            newCache[lowerToken] = {
              key: `k${nextIndex}`,
              value: `v${nextIndex}`,
              isHighlighted: false
            };
            return newCache;
          });
        }

        // Update paged cache
        const tokenIndex = step;
        const pageIndex = Math.floor(tokenIndex / PAGE_SIZE);
        const blockIndex = tokenIndex % PAGE_SIZE;

        setPages(prev => {
          const newPages = [...prev];
          // Clear all highlights and set active page
          newPages.forEach((page, idx) => {
            page.isActive = idx === pageIndex;
            if (page.blocks) {
              page.blocks.forEach(block => {
                if (block) {
                  block.isHighlighted = false;
                  block.isCacheHit = false;
                }
              });
            }
          });
          
          if (!newPages[pageIndex]) {
            newPages[pageIndex] = {
              blocks: Array(PAGE_SIZE).fill(null),
              isActive: true
            };
          }

          // Create the new block
          const newBlock: PageBlock = {
            token: lowerToken,
            key: isPagedCacheHit ? 'k0' : `k${Object.keys(cache).length}`,
            value: isPagedCacheHit ? 'v0' : `v${Object.keys(cache).length}`,
            isHighlighted: true,
            isProcessed: true,
            isCacheHit: isPagedCacheHit
          };

          // If we found a hit in the active page, highlight it
          if (isPagedCacheHit && hitPageIndex === pageIndex && hitBlockIndex !== -1) {
            if (newPages[hitPageIndex].blocks[hitBlockIndex]) {
              newPages[hitPageIndex].blocks[hitBlockIndex]!.isHighlighted = true;
              newPages[hitPageIndex].blocks[hitBlockIndex]!.isCacheHit = true;
            }
          }

          newPages[pageIndex].blocks[blockIndex] = newBlock;
          return newPages;
        });
      }
      // Generation phase
      else {
        setGenerating(true);
        const genStep = step - processingPhaseEndStep;
        const currentToken = genTokens[genStep];
        const lowerToken = currentToken.text.toLowerCase();

        // Check for cache hit in active pages only
        let isPagedCacheHit = false;
        let hitPageIndex = -1;
        let hitBlockIndex = -1;

        // First check active pages for the token
        pages.forEach((page, pageIndex) => {
          if (page.isActive) {
            page.blocks.forEach((block, blockIndex) => {
              if (block && block.token === lowerToken) {
                isPagedCacheHit = true;
                hitPageIndex = pageIndex;
                hitBlockIndex = blockIndex;
              }
            });
          }
        });

        // Update generated tokens
        setGenTokens(prev => prev.map((t, idx) => ({
          ...t,
          isProcessed: idx <= genStep,
          isCacheHit: idx === genStep && isPagedCacheHit,
          isHighlighted: idx === genStep
        })));

        // Update paged cache
        setPages(prev => {
          const newPages = [...prev];
          // Clear all highlights first
          newPages.forEach(page => {
            if (page.blocks) {
              page.blocks.forEach(block => {
                if (block) {
                  block.isHighlighted = false;
                  block.isCacheHit = false;
                }
              });
            }
          });

          // If we found a hit in the active page, highlight it
          if (isPagedCacheHit && hitPageIndex !== -1 && hitBlockIndex !== -1) {
            const hitBlock = newPages[hitPageIndex].blocks[hitBlockIndex];
            if (hitBlock) {
              hitBlock.isHighlighted = true;
              hitBlock.isCacheHit = true;
            }
          }

          // If we're adding a new token
          if (step === generationStartStep || step === secondGenerationStep) {
            const tokenIndex = tokens.length + genStep;
            const pageIndex = Math.floor(tokenIndex / PAGE_SIZE);
            const blockIndex = tokenIndex % PAGE_SIZE;

            // Set active page
            newPages.forEach((page, idx) => {
              page.isActive = idx === pageIndex;
            });

            if (!newPages[pageIndex]) {
              newPages[pageIndex] = {
                blocks: Array(PAGE_SIZE).fill(null),
                isActive: true
              };
            }

            // Create the new block
            const newBlock: PageBlock = {
              token: lowerToken,
              key: isPagedCacheHit ? `k${hitBlockIndex}` : `k${Object.keys(cache).length}`,
              value: isPagedCacheHit ? `v${hitBlockIndex}` : `v${Object.keys(cache).length}`,
              isHighlighted: true,
              isProcessed: true,
              isCacheHit: isPagedCacheHit
            };

            newPages[pageIndex].blocks[blockIndex] = newBlock;
          }

          return newPages;
        });

        // Update traditional cache highlighting and add new tokens
        setCache(prev => {
          const newCache = { ...prev };
          // Clear all highlights first
          Object.keys(newCache).forEach(key => {
            newCache[key].isHighlighted = false;
          });
          // If it's a cache hit in the active page, highlight the matching token
          if (isPagedCacheHit) {
            newCache[lowerToken].isHighlighted = true;
          } else {
            // Add new token to cache if not a hit
            const nextIndex = Object.keys(newCache).length;
            newCache[lowerToken] = {
              key: `k${nextIndex}`,
              value: `v${nextIndex}`,
              isHighlighted: false
            };
          }
          return newCache;
        });
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
                } ${page.isActive && block?.isCacheHit ? 'bg-green-50 border-green-200' : ''}`}
              >
                {block ? (
                  <>
                    <div className="font-mono text-sm mb-1 flex items-center gap-1">
                      {block.token}
                      {page.isActive && block.isCacheHit && (
                        <CheckCircle2 size={14} className="text-green-600" />
                      )}
                    </div>
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
    <>
      <Header 
        onNext={handleNext}
        buttonText={steps[step].action}
        showRestart={step === totalSteps - 1}
      />
      <div className="w-full max-w-6xl mx-auto p-4 pt-20">
        <Card>
          <CardHeader>
            <CardTitle>KV Cache vs Paged Attention Cache Comparison</CardTitle>
            <p className="text-gray-600 mt-2">
              Traditional KV caching keeps all processed tokens in GPU memory, which becomes a bottleneck for long sequences. <a href="https://dl.acm.org/doi/pdf/10.1145/3600006.3613165" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Paged attention</a> solves this by organizing tokens into fixed-size pages that can be efficiently swapped between GPU and CPU memory, allowing the model to process much longer sequences while maintaining fast access to recent context.
            </p>
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
                          step < idx + processingPhaseEndStep + 1 ? 'bg-gray-50' : 'bg-blue-100'
                        }`}
                      >
                        {token}
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
                          kv.isHighlighted ? 'bg-green-50 border border-green-200' : ''
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
                        {kv.isHighlighted && (
                          <CheckCircle2 size={14} className="text-green-600 ml-2" />
                        )}
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
            <div className="flex justify-start items-center mt-8">
              <div className="text-sm text-gray-500">
                Step {step + 1} of {totalSteps}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pr-[384px]">
        <KVCacheDemo />
      </div>
      <PaperChatSidebar />
    </main>
  )
}
