'use client';

import { useState, useEffect } from 'react';

export default function ResponsiveDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({
    windowWidth: 0,
    windowHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    devicePixelRatio: 1,
    orientation: 'landscape' as 'portrait' | 'landscape',
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  const getCurrentBreakpoint = () => {
    const width = dimensions.windowWidth;
    if (width < 640) return { name: 'xs', color: 'bg-red-500' };
    if (width < 768) return { name: 'sm', color: 'bg-orange-500' };
    if (width < 1024) return { name: 'md', color: 'bg-yellow-500' };
    if (width < 1280) return { name: 'lg', color: 'bg-green-500' };
    if (width < 1536) return { name: 'xl', color: 'bg-blue-500' };
    return { name: '2xl', color: 'bg-purple-500' };
  };

  const breakpoint = getCurrentBreakpoint();

  return (
    <>
      {/* Floating Debug Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center font-bold text-lg"
        title="Responsive Debugger"
      >
        📱
      </button>

      {/* Debug Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border-2 border-orange-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📱 Responsive Debugger
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-white">
              {/* Current Breakpoint */}
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">🎯 Current Breakpoint</h3>
                <div className="flex items-center gap-4">
                  <div className={`${breakpoint.color} text-white px-6 py-3 rounded-lg font-bold text-2xl`}>
                    {breakpoint.name.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">
                    {breakpoint.name === 'xs' && '< 640px (Mobile)'}
                    {breakpoint.name === 'sm' && '640px - 767px (Large Mobile)'}
                    {breakpoint.name === 'md' && '768px - 1023px (Tablet)'}
                    {breakpoint.name === 'lg' && '1024px - 1279px (Small Desktop)'}
                    {breakpoint.name === 'xl' && '1280px - 1535px (Desktop)'}
                    {breakpoint.name === '2xl' && '≥ 1536px (Large Desktop)'}
                  </div>
                </div>
              </div>

              {/* Window Dimensions */}
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">🪟 Window / Viewport</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm text-gray-400">Width</div>
                    <div className="text-2xl font-bold text-green-400">{dimensions.windowWidth}px</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm text-gray-400">Height</div>
                    <div className="text-2xl font-bold text-green-400">{dimensions.windowHeight}px</div>
                  </div>
                </div>
              </div>

              {/* Screen Resolution */}
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">🖥️ Screen Resolution</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm text-gray-400">Width</div>
                    <div className="text-2xl font-bold text-blue-400">{dimensions.screenWidth}px</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm text-gray-400">Height</div>
                    <div className="text-2xl font-bold text-blue-400">{dimensions.screenHeight}px</div>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">📲 Device Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-gray-700 rounded p-3">
                    <span className="text-gray-400">Pixel Ratio:</span>
                    <span className="font-bold text-purple-400">{dimensions.devicePixelRatio}x</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 rounded p-3">
                    <span className="text-gray-400">Orientation:</span>
                    <span className="font-bold text-purple-400">{dimensions.orientation === 'portrait' ? '📱 Portrait' : '📱 Landscape'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 rounded p-3">
                    <span className="text-gray-400">User Agent:</span>
                    <span className="font-mono text-xs text-purple-400 truncate max-w-xs" title={navigator.userAgent}>
                      {navigator.userAgent.slice(0, 40)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Tailwind Breakpoints Reference */}
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">📏 Tailwind Breakpoints</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-gray-700 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500 w-4 h-4 rounded"></div>
                      <span className="font-mono">xs</span>
                    </div>
                    <span className="text-gray-400">&lt; 640px</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-500 w-4 h-4 rounded"></div>
                      <span className="font-mono">sm</span>
                    </div>
                    <span className="text-gray-400">≥ 640px</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-yellow-500 w-4 h-4 rounded"></div>
                      <span className="font-mono">md</span>
                    </div>
                    <span className="text-gray-400">≥ 768px</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500 w-4 h-4 rounded"></div>
                      <span className="font-mono">lg</span>
                    </div>
                    <span className="text-gray-400">≥ 1024px</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500 w-4 h-4 rounded"></div>
                      <span className="font-mono">xl</span>
                    </div>
                    <span className="text-gray-400">≥ 1280px</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-500 w-4 h-4 rounded"></div>
                      <span className="font-mono">2xl</span>
                    </div>
                    <span className="text-gray-400">≥ 1536px</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-orange-900 bg-opacity-30 rounded-lg p-4 border-2 border-orange-500">
                <h3 className="text-lg font-semibold mb-2 text-orange-400">💡 Tips</h3>
                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  <li>Resize je browser venster om de breakpoints te testen</li>
                  <li>Test op echte devices voor de beste resultaten</li>
                  <li>Check Chrome DevTools voor device emulation</li>
                  <li>Let op pixel ratio voor high-DPI displays (Retina, etc.)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

