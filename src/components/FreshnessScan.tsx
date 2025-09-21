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
    // Simulate ML prediction
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
      case 'fresh': return <CheckCircle className="w-6 h-6 text-primary" />;
      case 'semi-fresh': return <AlertCircle className="w-6 h-6 text-warning" />;
      case 'spoiled': return <XCircle className="w-6 h-6 text-destructive" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'text-primary';
      case 'semi-fresh': return 'text-warning';
      case 'spoiled': return 'text-destructive';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Food Freshness Scanner</h2>
        <p className="text-muted-foreground">Upload an image to check if your food is fresh, semi-fresh, or spoiled</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Scan Your Food</CardTitle>
          <CardDescription className="text-center">
            Take a photo or upload an image of your food item
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3">
            <Button variant="upload" size="lg" onClick={handleFileUpload} className="h-32">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8" />
                <span>Upload Image</span>
                <span className="text-xs text-muted-foreground">JPG, PNG up to 10MB</span>
              </div>
            </Button>
            
            <Button variant="outline" size="lg" onClick={handleFileUpload}>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>

          {scanResult && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    {getStatusIcon(scanResult.status)}
                    <span className={`text-lg font-semibold capitalize ${getStatusColor(scanResult.status)}`}>
                      {scanResult.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Confidence: {scanResult.confidence}%
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="font-medium">Recommendations:</div>
                    {scanResult.recommendations.map((rec, index) => (
                      <div key={index} className="text-muted-foreground">• {rec}</div>
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