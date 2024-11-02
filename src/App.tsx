import React, { useState } from 'react';
import { FileText, RefreshCw, Copy, Check } from 'lucide-react';
import { parseRules } from './utils';
import { ArmTemplate } from './types';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<ArmTemplate | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convertToJson = (inputString: string) => {
    try {
      const result = parseRules(inputString);
      setOutput(result);
      setError('');
    } catch (err) {
      setError('Invalid input format. Please check your input strings.');
      setOutput(null);
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(JSON.stringify(output, null, 4));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Azure Firewall Policy Converter</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <label className="block text-sm font-medium mb-2">
              Input Rules (one per line)
            </label>
            <textarea
              className="w-full h-64 px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your firewall rules here, one rule per line..."
            />
            <button
              onClick={() => convertToJson(input)}
              className="mt-4 flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Convert to ARM Template
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
              {error}
            </div>
          )}

          {output && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Azure Firewall Policy ARM Template</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {output.resources.length - 1} rule collection{output.resources.length !== 2 ? 's' : ''} generated
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="bg-gray-700 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(output, null, 4)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;