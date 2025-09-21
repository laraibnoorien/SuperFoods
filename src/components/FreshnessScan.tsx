import { useState } from "react";
import { Camera, Upload, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FreshnessScan = () => {
  const [scanResult, setScanResult] = useState<{
    status: 'fresh' | 'semi-fresh' | 'spoiled';
    confidence: number;
    recommendations: string[];
  } | null>(null);

  const handleFileUpload = () => {
    const results = [
      { status: 'fresh' as const, confidence: 92, recommendations: ['Store in refrigerator', 'Best used within 3-5 days'] },
      { status: 'semi-fresh' as const, confidence: 78, recommendations: ['Use soon', 'Cook thoroughly before eating'] },
      { status: 'spoiled' as const, confidence: 95, recommendations: ['Do not consume', 'Discard immediately'] },
    ];
    
    setTimeout(() => {
      setScanResult(results[Math.floor(Math.random() * results.length)]);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'semi-fresh': return <AlertCircle className="w-6 h-6 text-amber-400" />;
      case 'spoiled': return <XCircle className="w-6 h-6 text-red-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 min-h-screen bg-black p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">
          Food Freshness Scanner
        </h2>
        <p className="text-gray-400">
          Upload an image to check if your food is fresh, semi-fresh, or spoiled
        </p>
      </div>

      {/* Upload Card */}
      <Card className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-white">Scan Your Food</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Take a photo or upload an image of your food item
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleFileUpload}
              className="h-32 bg-neutral-950 border border-emerald-600 text-gray-200 hover:bg-emerald-900 transition flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="w-8 h-8 text-emerald-400" />
              <span>Upload Image</span>
              <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleFileUpload}
              className="border-emerald-600 text-emerald-400 hover:bg-emerald-900"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <Card className="bg-neutral-950 border border-neutral-800 mt-4">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    {getStatusIcon(scanResult.status)}
                    <span className={`text-lg font-semibold capitalize ${
                      scanResult.status === 'fresh' ? 'text-emerald-400' :
                      scanResult.status === 'semi-fresh' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {scanResult.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Confidence: {scanResult.confidence}%
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="font-medium text-white">Recommendations:</div>
                    {scanResult.recommendations.map((rec, index) => (
                      <div key={index} className="text-gray-400">• {rec}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FreshnessScan;
