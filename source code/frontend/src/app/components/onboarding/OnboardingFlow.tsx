import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api, optionsApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { OnboardingHeader } from './OnboardingHeader';
import { ProgressIndicator } from './ProgressIndicator';
import { PersonalInformation } from './steps/PersonalInformation';
import { BodyMeasurements } from './steps/BodyMeasurements';
import { HealthConditions } from './steps/HealthConditions';
import { FoodAllergies } from './steps/FoodAllergies';
import { NutritionGoal } from './steps/NutritionGoal';
import { Confirmation } from './steps/Confirmation';

interface FormData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  conditions: string[];
  allergies: string[];
  goal: string;
}

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    conditions: [],
    allergies: [],
    goal: ''
  });

  const [touched, setTouched] = useState({
    age: false,
    gender: false,
    height: false,
    weight: false,
    goal: false
  });

  const [conditionMap, setConditionMap] = useState<Record<string, number>>({});
  const [allergyMap, setAllergyMap] = useState<Record<string, number>>({});
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [optionsError, setOptionsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      try {
        const [condRes, algRes] = await Promise.all([
          optionsApi.getHealthConditions(),
          optionsApi.getAllergies()
        ]);
        
        if (mounted) {
          if (condRes.ok && algRes.ok) {
            const cMap: Record<string, number> = {};
            condRes.health_conditions?.forEach(c => cMap[c.name] = c.id);
            setConditionMap(cMap);

            const aMap: Record<string, number> = {};
            algRes.allergies?.forEach(a => aMap[a.name] = a.id);
            setAllergyMap(aMap);
            
            setOptionsLoaded(true);
          } else {
            setOptionsError(true);
          }
        }
      } catch (err) {
        if (mounted) setOptionsError(true);
      }
    };
    loadOptions();
    return () => { mounted = false; };
  }, []);

  const stepTitles = [
    'Personal Information',
    'Body Measurements',
    'Health Conditions',
    'Food Allergies',
    'Nutrition Goal',
    'Confirmation'
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.age !== '' && parseInt(formData.age) > 0 && formData.gender !== '';
      case 2:
        return formData.height !== '' && parseFloat(formData.height) > 0 &&
               formData.weight !== '' && parseFloat(formData.weight) > 0;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return formData.goal !== '';
      case 6:
        return true;
      default:
        return false;
    }
  };

  const getStepErrors = (step: number) => {
    const errors: any = {};

    if (step === 1) {
      if (!formData.age || parseInt(formData.age) <= 0) {
        errors.age = 'Please enter a valid age';
      }
      if (!formData.gender) {
        errors.gender = 'Please select your gender';
      }
    }

    if (step === 2) {
      if (!formData.height || parseFloat(formData.height) <= 0) {
        errors.height = 'Please enter a valid height';
      }
      if (!formData.weight || parseFloat(formData.weight) <= 0) {
        errors.weight = 'Please enter a valid weight';
      }
    }

    if (step === 5) {
      if (!formData.goal) {
        errors.goal = 'Please select a nutrition goal';
      }
    }

    return errors;
  };

  const handleFieldChange = (field: string, value: string | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setTouched({ ...touched, age: true, gender: true });
    } else if (currentStep === 2) {
      setTouched({ ...touched, height: true, weight: true });
    } else if (currentStep === 5) {
      setTouched({ ...touched, goal: true });
    }

    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const mapGender = (g: string) => g.toUpperCase().replace(/-/g, '_');
  const mapGoal = (g: string) => {
    if (g === 'weight-loss') return 'WEIGHT_LOSS';
    if (g === 'weight-maintenance') return 'MAINTENANCE';
    if (g === 'weight-gain') return 'WEIGHT_GAIN';
    return g.toUpperCase();
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        age: parseInt(formData.age),
        gender: mapGender(formData.gender),
        height_cm: parseFloat(formData.height),
        weight_kg: parseFloat(formData.weight),
        nutrition_goal: mapGoal(formData.goal),
        health_conditions: [],
        allergies: []
      };
      
      const response = await api.post('/onboarding/', payload, {
        headers: { 'Idempotency-Key': `onboarding-${Date.now()}` }
      });
      const result = await response.json();
      
      if (result.success) {
        await refreshUser();
        navigate('/dashboard');
      } else {
        const errorDetails = result.error?.details 
          ? Object.entries(result.error.details).map(([k, v]) => `${k}: ${v}`).join(', ') 
          : '';
        alert(`Validation Error: ${result.error?.message || "Failed"} ${errorDetails}`);
      }
    } catch (err: any) {
      alert("Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = stepTitles.map((title, index) => ({
    number: index + 1,
    title,
    completed: index + 1 < currentStep,
    active: index + 1 === currentStep
  }));

  const errors = getStepErrors(currentStep);
  const isStepValid = validateStep(currentStep);

  if (optionsError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md border border-destructive/20">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Could not load safety options</h2>
          <p className="mb-4">Please refresh and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!optionsLoaded && !isComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading onboarding...</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <OnboardingHeader currentStep={6} totalSteps={6} />
        <main className="flex-1 flex items-center py-12 md:py-20">
          <div className="max-w-2xl mx-auto px-6 w-full">
            <div className="bg-card rounded-2xl p-12 border border-border shadow-sm text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-semibold text-foreground mb-3">
                Profile setup complete
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                You're ready to start using Mazaj+ for personalized nutrition guidance
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingHeader currentStep={currentStep} totalSteps={6} />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
            <div className="order-2 lg:order-1">
              <ProgressIndicator steps={steps} />
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm">
                {currentStep === 1 && (
                  <PersonalInformation
                    data={{ age: formData.age, gender: formData.gender }}
                    errors={errors}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                    touched={{ age: touched.age, gender: touched.gender }}
                  />
                )}

                {currentStep === 2 && (
                  <BodyMeasurements
                    data={{ height: formData.height, weight: formData.weight }}
                    errors={errors}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                    touched={{ height: touched.height, weight: touched.weight }}
                  />
                )}

                {currentStep === 3 && (
                  <HealthConditions
                    data={{ conditions: formData.conditions }}
                    options={Object.keys(conditionMap)}
                    onChange={handleFieldChange}
                  />
                )}

                {currentStep === 4 && (
                  <FoodAllergies
                    data={{ allergies: formData.allergies }}
                    options={Object.keys(allergyMap)}
                    onChange={handleFieldChange}
                  />
                )}

                {currentStep === 5 && (
                  <NutritionGoal
                    data={{ goal: formData.goal }}
                    errors={errors}
                    onChange={handleFieldChange}
                    touched={{ goal: touched.goal }}
                  />
                )}

                {currentStep === 6 && (
                  <Confirmation
                    data={formData}
                    onEdit={handleEdit}
                  />
                )}

                <div className="mt-8 pt-8 border-t border-border flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>

                  {currentStep < 6 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepValid}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-sm"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Complete Setup'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}