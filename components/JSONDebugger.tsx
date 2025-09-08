import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function JSONDebugger() {
  const [status, setStatus] = useState<{[key: string]: any}>({});
  const [testing, setTesting] = useState(false);

  const testJSONFiles = async () => {
    setTesting(true);
    const results: {[key: string]: any} = {};
    
    const files = [
      'usuarios.json',
      'clientes.json', 
      'guias.json',
      'facturas-impagas.json'
    ];

    for (const file of files) {
      try {
        console.log(`🧪 Testing ${file}...`);
        const response = await fetch(`/data/${file}`, {
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const data = await response.json();
          results[file] = {
            status: 'OK',
            length: Array.isArray(data) ? data.length : 'Not array',
            size: JSON.stringify(data).length,
            sample: Array.isArray(data) && data.length > 0 ? data[0] : data
          };
        } else {
          results[file] = {
            status: 'ERROR',
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }
      } catch (error: any) {
        results[file] = {
          status: 'ERROR',
          error: error.message
        };
      }
    }
    
    setStatus(results);
    setTesting(false);
  };

  useEffect(() => {
    testJSONFiles();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">JSON Status</h3>
        <Button 
          size="sm" 
          onClick={testJSONFiles} 
          disabled={testing}
        >
          {testing ? 'Testing...' : 'Refresh'}
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        {Object.entries(status).map(([file, result]) => (
          <div key={file} className="border rounded p-2">
            <div className={`font-medium ${result.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
              {file}: {result.status}
            </div>
            {result.status === 'OK' && (
              <div className="text-gray-600">
                <div>Records: {result.length}</div>
                <div>Size: {result.size} bytes</div>
                {result.sample && (
                  <details className="mt-1">
                    <summary>Sample</summary>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result.sample, null, 2).substring(0, 200)}...
                    </pre>
                  </details>
                )}
              </div>
            )}
            {result.status === 'ERROR' && (
              <div className="text-red-500 text-xs">{result.error}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}