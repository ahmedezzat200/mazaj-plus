import { useRef, useState, useEffect } from 'react';
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
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { RefreshCw, Upload } from 'lucide-react';
import { subscriptionApi, uploadsApi } from '../../../../lib/api';

export type UploadState =
  | 'idle'
  | 'preview'
  | 'processing'
  | 'result'
  | 'no-recognition'
  | 'no-database-match'
  | 'under-development'
  | 'error'
  | 'loading-access';

export interface NutritionAnalysis {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingNote: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
}

export function FoodImageAnalysisPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();

  const [uploadState, setUploadState] = useState<UploadState>('loading-access');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasAccess, setHasAccess] = useState(false);
  const [hasInBodyAccess, setHasInBodyAccess] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [inBodyStatus, setInBodyStatus] = useState<string | null>(null);
  const [inBodyError, setInBodyError] = useState<string | null>(null);
  const [isInBodyUploading, setIsInBodyUploading] = useState(false);
  const inBodyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await subscriptionApi.getMe();
        if (res.ok && res.data) {
          setHasAccess(!!res.data.features.food_image_upload);
          setHasInBodyAccess(!!res.data.features.inbody_upload);
          setUploadState('idle');
        } else {
          setFetchError(true);
        }
      } catch (err) {
        setFetchError(true);
      }
    };
    checkAccess();
  }, []);

  const handleImageUpload = (file: File) => {
    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setUploadState('processing');
    setErrorMessage('');

    try {
      const result = await uploadsApi.uploadFoodImage(uploadedImage.file);
      if (result.ok && result.data) {
        setAnalysisResult({
          foodName: result.data.matched_food.name,
          calories: result.data.matched_food.calories,
          protein: result.data.matched_food.protein,
          carbs: result.data.matched_food.carbs,
          fat: result.data.matched_food.fat,
          servingNote: result.data.message,
        });
        setUploadState('result');
      } else if (result.error?.code === 'NO_FOOD_DETECTED') {
        setUploadState('no-recognition');
      } else if (result.error?.code === 'NO_DATABASE_MATCH') {
        setUploadState('no-database-match');
      } else {
        setErrorMessage(result.error?.message || 'Something went wrong. Please try again.');
        setUploadState('error');
      }
    } catch {
      setErrorMessage('Unable to reach the server. Please check your connection.');
      setUploadState('error');
    }
  };

  const handleInBodyFile = async (file: File | undefined) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setInBodyError('Unsupported format. Please upload a PDF, JPG, or PNG file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setInBodyError('File too large. Maximum size is 20MB.');
      return;
    }

    setIsInBodyUploading(true);
    setInBodyError(null);
    setInBodyStatus(null);

    try {
      const result = await uploadsApi.uploadInBody(file);
      if (result.ok && result.data) {
        setInBodyStatus(result.data.message);
      } else {
        setInBodyError(result.error?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setInBodyError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsInBodyUploading(false);
      if (inBodyInputRef.current) inBodyInputRef.current.value = '';
    }
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

      {/* Main content wrapper with sub-navigation */}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="food" className="w-full">
          <div className="border-b border-border bg-card">
            <div className="px-4 md:px-6 lg:px-8">
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
                  disabled={uploadState === 'loading-access'}
                >
                  InBody Upload
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {uploadState === 'loading-access' ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Checking your subscription access...</p>
              </div>
            ) : fetchError ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-2xl mx-auto">
                <p className="text-destructive font-medium mb-4">Unable to load subscription access. Please try again.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <TabsContent value="food" className="m-0 focus-visible:outline-none">
                  {!hasAccess ? (
                    <LockedUploadState />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Main upload/result area */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-2">
                          <p className="text-sm text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <strong>Pro/Ultra Benefit:</strong> Food image recognition is backend-controlled. Nutrition values come only from the Mazaj+ database.
                          </p>
                        </div>
                        
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
                          />
                        )}

                        {uploadState === 'under-development' && (
                          <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-8">
                              <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                                  <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                  <h3 className="text-lg font-semibold text-foreground">
                                    Recognition Workflow Under Development
                                  </h3>
                                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    Food image upload is available for your tier, but the recognition workflow is still under development. No nutrition estimate is generated yet.
                                  </p>
                                </div>
                                <div className="pt-4">
                                  <Button onClick={handleReset} variant="outline" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Analyze Another Image
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
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
                </TabsContent>

                <TabsContent value="inbody" className="m-0 focus-visible:outline-none">
                  {!hasInBodyAccess ? (
                    <LockedUploadState />
                  ) : (
                    <div className="max-w-3xl mx-auto py-12">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-semibold">InBody Data Integration</h2>
                        <p className="text-muted-foreground">
                          {userData.tier} Benefit: InBody upload is validated by the backend. Automated parsing is still under development.
                        </p>
                        <div className="pt-6">
                          <Button
                            variant="outline"
                            disabled={isInBodyUploading}
                            onClick={() => inBodyInputRef.current?.click()}
                          >
                            {isInBodyUploading ? 'Uploading...' : 'Choose InBody File'}
                          </Button>
                          <input
                            ref={inBodyInputRef}
                            type="file"
                            accept="application/pdf,image/jpeg,image/jpg,image/png"
                            className="hidden"
                            onChange={(event) => handleInBodyFile(event.target.files?.[0])}
                          />
                        </div>
                        {inBodyStatus && (
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
                            {inBodyStatus}
                          </div>
                        )}
                        {inBodyError && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
                            {inBodyError}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}


