import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PDFFile, Issue } from '../App';

interface PDFViewerProps {
  pdfFile: PDFFile;
  issues: Issue[];
  onPDFClick: (x: number, y: number, pageNumber: number) => void;
  highlightedIssueId: string | null;
  onNumPagesChange: (numPages: number) => void;
}

export function PDFViewer({ 
  pdfFile, 
  issues, 
  onPDFClick, 
  highlightedIssueId,
  onNumPagesChange 
}: PDFViewerProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Load PDF.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      loadPDF();
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [pdfFile.url]);

  const loadPDF = async () => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) return;

    setIsLoading(true);
    try {
      const pdf = await pdfjsLib.getDocument(pdfFile.url).promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      onNumPagesChange(pdf.numPages);
      renderPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      setIsLoading(false);
    } catch (error) {
      console.error('Error rendering page:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pageNumber);
    }
  }, [pageNumber, scale]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFitToWidth = () => {
    if (containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      const canvasWidth = canvasRef.current.width / scale;
      setScale(containerWidth / canvasWidth);
    }
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current || !canvasRef.current) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to relative coordinates (0-1 range) based on actual canvas size
    const canvas = canvasRef.current;
    const relativeX = clickX / canvas.width;
    const relativeY = clickY / canvas.height;
    
    onPDFClick(relativeX, relativeY, pageNumber);
  }, [onPDFClick, pageNumber]);

  const getSeverityColor = (severity: Issue['severity']) => {
    switch (severity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-blue-500';
    }
  };

  // Helper function to get issue number based on original issues array order
  const getIssueNumber = (issueId: string): number => {
    return issues.findIndex(i => i.id === issueId) + 1;
  };

  const currentPageIssues = issues.filter(issue => issue.pageNumber === pageNumber);

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-slate-600" />
          </button>
          <span className="text-sm text-slate-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={handleFitToWidth}
            className="p-2 hover:bg-slate-100 rounded transition-colors ml-2"
            title="Fit to Width"
          >
            <Maximize2 className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {numPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1}
              className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm text-slate-600">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
              disabled={pageNumber === numPages}
              className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}

        <div className="text-sm text-slate-500">
          {currentPageIssues.length} issue{currentPageIssues.length !== 1 ? 's' : ''} on this page
        </div>
      </div>

      {/* PDF Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-6"
      >
        <div className="inline-block min-w-full">
          <div className="relative inline-block shadow-lg bg-white">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Loading drawing...</p>
                </div>
              </div>
            )}
            
            <div className="relative">
              <canvas 
                ref={canvasRef}
                className="block"
              />
              
              {/* Pin Overlay */}
              <div
                ref={overlayRef}
                className="absolute inset-0 cursor-crosshair"
                onClick={handleCanvasClick}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {currentPageIssues.map((issue) => {
                  // Use percentage-based positioning so pins scale with canvas
                  // issue.x and issue.y are already in 0-1 range (relative coordinates)
                  const issueNumber = getIssueNumber(issue.id);
                  
                  return (
                    <div
                      key={issue.id}
                      className={`
                        absolute group cursor-pointer
                        ${highlightedIssueId === issue.id ? 'z-50' : 'z-10'}
                      `}
                      style={{
                        left: `${issue.x * 100}%`,
                        top: `${issue.y * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {/* Pin */}
                      <div className="relative">
                        <div 
                          className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          border-3 border-white shadow-lg
                          transition-all duration-200
                          ${getSeverityColor(issue.severity)}
                          ${highlightedIssueId === issue.id 
                            ? 'scale-150 animate-pulse ring-4 ring-blue-400' 
                            : 'group-hover:scale-125'
                          }
                        `}
                        >
                          <span className="text-white text-xs font-medium">
                            {issueNumber}
                          </span>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          <div className="bg-slate-900 text-white px-3 py-2 rounded shadow-lg text-xs max-w-xs">
                            <div className="mb-1">
                              <span className="font-medium">Issue #{issueNumber}</span>
                              {issue.aiGenerated && (
                                <span className="ml-2 px-1.5 py-0.5 bg-purple-600 rounded text-xs">AI</span>
                              )}
                            </div>
                            <div className="text-slate-300">{issue.type}</div>
                            <div className="text-slate-300 truncate max-w-[200px]">{issue.description}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}