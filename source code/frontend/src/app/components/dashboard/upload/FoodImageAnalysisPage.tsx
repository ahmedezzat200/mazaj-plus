import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { UploadAdvisoryBanner } from './UploadAdvisoryBanner';
import { UploadSection } from './UploadSection';
import { ImagePreview } from './ImagePreview';
import { ProcessingState } from './ProcessingState';
import { AnalysisResultCard } from './AnalysisResultCard';
import { NoRecognitionCard } from './NoRecognitionCard';
import { NoDatabaseMatchCard } from './NoDatabaseMatchCard';
import { LockedUploadState } from './LockedUploadState';
import { UploadSupportCards } from './UploadSupportCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

export type UploadState =
  | 'idle'
  | 'preview'
  | 'processing'
  | 'result'
  | 'no-recognition'
  | 'no-database-match'
  | 'error';

export interface NutritionAnalysis {
  foodName: string;
  calories: number;
  protein: number;
  fat: number;
  servingNote: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
}

export function FoodImageAnalysisPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Check if user has access (Locked for demo as feature is not yet implemented)
  const hasAccess = false;

  const handleImageUpload = (file: File) => {
    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPG or PNG image.');
      setUploadState('error');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrorMessage('File too large. Maximum size is 10MB.');
      setUploadState('error');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setUploadedImage({ file, preview });
    setUploadState('preview');
    setErrorMessage('');
  };

  const handleAnalyze = () => {
    if (!uploadedImage) return;

    setUploadState('processing');

    // Simulate processing
    setTimeout(() => {
      const random = Math.random();

      // 10% chance of no recognition
      if (random < 0.1) {
        setUploadState('no-recognition');
      }
      // 10% chance of no database match
      else if (random < 0.2) {
        setUploadState('no-database-match');
      }
      // 80% success
      else {
        setAnalysisResult(generateMockAnalysis());
        setUploadState('result');
      }
    }, 3000);
  };

  const handleReset = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setAnalysisResult(null);
    setUploadState('idle');
    setErrorMessage('');
  };

  const handleRemoveImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setUploadState('idle');
  };

  return (
    <div className="min-h-full bg-background">
      {/* Advisory banner */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
          <UploadAdvisoryBanner />
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Tabs defaultValue="food" className="w-full">
            <TabsList className="bg-transparent border-0 h-auto p-0">
              <TabsTrigger
                value="food"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                Food Image Analysis
              </TabsTrigger>
              <TabsTrigger
                value="inbody"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                disabled
              >
                InBody Upload
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {!hasAccess ? (
          <LockedUploadState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main upload/result area */}
            <div className="lg:col-span-2 space-y-6">
              {uploadState === 'idle' && (
                <UploadSection onUpload={handleImageUpload} />
              )}

              {uploadState === 'preview' && uploadedImage && (
                <ImagePreview
                  image={uploadedImage}
                  onAnalyze={handleAnalyze}
                  onRemove={handleRemoveImage}
                  onReplace={handleReset}
                />
              )}

              {uploadState === 'processing' && <ProcessingState />}

              {uploadState === 'result' && analysisResult && (
                <AnalysisResultCard
                  result={analysisResult}
                  onAnalyzeAnother={handleReset}
                  userTier={userData.tier}
                />
              )}

              {uploadState === 'no-recognition' && (
                <NoRecognitionCard onTryAgain={handleReset} />
              )}

              {uploadState === 'no-database-match' && (
                <NoDatabaseMatchCard onAnalyzeAnother={handleReset} />
              )}

              {uploadState === 'error' && errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                  <button
                    onClick={handleReset}
                    className="text-sm text-primary hover:underline mt-2"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <UploadSupportCards userData={userData} uploadState={uploadState} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock analysis generator
function generateMockAnalysis(): NutritionAnalysis {
  const foods = [
    { name: 'Grilled Chicken Breast', calories: 165, protein: 31, fat: 3.6 },
    { name: 'Caesar Salad', calories: 280, protein: 12, fat: 22 },
    { name: 'Salmon Fillet', calories: 206, protein: 22, fat: 13 },
    { name: 'Greek Yogurt Bowl', calories: 150, protein: 15, fat: 4 },
    { name: 'Avocado Toast', calories: 250, protein: 8, fat: 15 },
    { name: 'Quinoa Bowl', calories: 220, protein: 8, fat: 4 },
  ];

  const food = foods[Math.floor(Math.random() * foods.length)];

  return {
    foodName: food.name,
    calories: food.calories,
    protein: food.protein,
    fat: food.fat,
    servingNote: 'per standard serving (approximately 100g)',
  };
}
