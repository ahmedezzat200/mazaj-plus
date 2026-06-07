import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { profileApi, optionsApi, UserProfileData } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useOutletContext, Link, useBlocker } from 'react-router';
import { UserData } from '../DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { Input } from '../../ui/input';
import { 
  User, Mail, Calendar, Weight, Ruler, Target, Heart, 
  Edit2, Check, X, Crown, AlertCircle, Info, ShieldCheck
} from 'lucide-react';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { userData } = useOutletContext<{ userData: UserData }>();
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [healthOptions, setHealthOptions] = useState<{ id: number; name: string }[]>([]);
  const [allergyOptions, setAllergyOptions] = useState<{ id: number; name: string }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    nutrition_goal: '',
    health_conditions: [] as number[],
    allergies: [] as number[],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!isEditing || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isEditing, isDirty]);

  const blocker = useBlocker(isEditing && isDirty);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, healthRes, allergyRes] = await Promise.all([
        profileApi.getMe(),
        optionsApi.getHealthConditions(),
        optionsApi.getAllergies(),
      ]);

      if (profileRes.ok && profileRes.profile) {
        const p = profileRes.profile;
        setProfile(p);
        updateFormDataFromProfile(p);
      } else {
        setError('Unable to load your profile. Please try again.');
      }

      if (healthRes.ok) setHealthOptions(healthRes.health_conditions || []);
      if (allergyRes.ok) setAllergyOptions(allergyRes.allergies || []);

    } catch (err) {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormDataFromProfile = (p: UserProfileData) => {
    setFormData({
      age: p.age?.toString() || '',
      gender: p.gender || '',
      height_cm: p.height_cm || '',
      weight_kg: p.weight_kg || '',
      nutrition_goal: p.nutrition_goal || 'MAINTENANCE',
      health_conditions: p.health_conditions.map(hc => hc.health_condition_id),
      allergies: p.allergies.map(a => a.allergy_id),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setSuccess(null);
    setError(null);
  };

  const handleToggleOption = (type: 'health_conditions' | 'allergies', id: number) => {
    if (!isEditing) return;
    setFormData(prev => {
      const current = prev[type];
      const next = current.includes(id)
        ? current.filter(i => i !== id)
        : [...current, id];
      return { ...prev, [type]: next };
    });
    setIsDirty(true);
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        height_cm: formData.height_cm || null,
        weight_kg: formData.weight_kg || null,
        nutrition_goal: formData.nutrition_goal || null,
        health_conditions: formData.health_conditions,
        allergies: formData.allergies,
      };

      const res = await profileApi.updateMe(payload);
      if (res.ok) {
        setSuccess('Profile updated successfully.');
        toast.success('Profile updated');
        setProfile(res.profile || null);
        if (res.profile) updateFormDataFromProfile(res.profile);
        setIsEditing(false);
        setIsDirty(false);
        await refreshUser();
      } else {
        setError(res.error?.message || 'Please check the profile information and try again.');
        toast.error(res.error?.message || 'Could not save profile.');
      }
    } catch (err) {
      setError('Unable to reach the server. Please check your connection.');
      toast.error('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) updateFormDataFromProfile(profile);
    setIsEditing(false);
    setIsDirty(false);
    setError(null);
    setSuccess(null);
  };

  // UI Helpers
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const bmi = formData.height_cm && formData.weight_kg
    ? (parseFloat(formData.weight_kg) / Math.pow(parseFloat(formData.height_cm) / 100, 2)).toFixed(1)
    : null;

  const filledCount = [formData.age, formData.gender, formData.height_cm, formData.weight_kg, formData.nutrition_goal].filter(Boolean).length;
  const completeness = Math.round(filledCount / 5 * 100);

  if (loading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* Unsaved changes blocker dialog */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold">Unsaved Changes</h3>
            <p className="text-sm text-muted-foreground">You have unsaved profile changes. Are you sure you want to leave?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => blocker.reset()}>Stay</Button>
              <Button variant="destructive" size="sm" onClick={() => blocker.proceed()}>Leave</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm">
          <Check className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(user?.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-foreground truncate">{user?.full_name}</h2>
                <Badge variant="secondary" className={
                  userData.tier === 'Ultra' ? 'bg-primary text-primary-foreground' :
                  userData.tier === 'Pro' ? 'bg-secondary text-secondary-foreground' :
                  'bg-muted text-muted-foreground'
                }>
                  {userData.tier === 'Ultra' && <Crown className="h-3 w-3 mr-1" />}
                  {userData.tier} Plan
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>

              {/* Completeness */}
              <div className="mt-3 max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Profile completeness</span>
                  <span className="text-xs font-medium text-foreground">{completeness}%</span>
                </div>
                <Progress value={completeness} className="h-1.5" />
              </div>
            </div>

            <div className="flex gap-2 self-start sm:self-center">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Saving...' : <><Check className="h-4 w-4 mr-1.5" />Save</>}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                    <X className="h-4 w-4 mr-1.5" />Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-1.5" />Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-4 border-b border-border/50 mb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Age</label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input type="number" name="age" value={formData.age} onChange={handleInputChange} className="h-9" placeholder="Years" />
                    <span className="text-xs text-muted-foreground">years</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium">{formData.age ? `${formData.age} years` : 'Not set'}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Gender</label>
                {isEditing ? (
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-primary outline-none">
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium">{formData.gender ? formData.gender.replace(/_/g, ' ') : 'Not set'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Body Measurements */}
          <Card>
            <CardHeader className="pb-4 border-b border-border/50 mb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ruler className="h-4 w-4 text-primary" />Body Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Height</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input type="number" name="height_cm" value={formData.height_cm} onChange={handleInputChange} className="h-9" placeholder="cm" />
                      <span className="text-xs text-muted-foreground">cm</span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{formData.height_cm ? `${formData.height_cm} cm` : 'Not set'}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Weight</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleInputChange} className="h-9" placeholder="kg" />
                      <span className="text-xs text-muted-foreground">kg</span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{formData.weight_kg ? `${formData.weight_kg} kg` : 'Not set'}</p>
                  )}
                </div>
              </div>

              {/* BMI Card */}
              {bmi ? (
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">BMI Reference</p>
                      <p className="text-2xl font-bold text-foreground">{bmi}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground leading-relaxed italic max-w-[120px]">
                        For profile reference only. This is not a medical diagnosis.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <p className="text-xs italic">BMI will appear when height and weight are completed.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health & Safety */}
          <Card>
            <CardHeader className="pb-4 border-b border-border/50 mb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-primary" />Health & Safety Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground mb-3">Health Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {healthOptions.length > 0 ? healthOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => handleToggleOption('health_conditions', option.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                        formData.health_conditions.includes(option.id)
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/50 disabled:hover:border-border'
                      }`}
                    >
                      {option.name}
                    </button>
                  )) : <p className="text-xs text-muted-foreground italic">Loading options...</p>}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-3">Food Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {allergyOptions.length > 0 ? allergyOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => handleToggleOption('allergies', option.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                        formData.allergies.includes(option.id)
                          ? 'bg-destructive border-destructive text-destructive-foreground shadow-sm'
                          : 'bg-muted/50 border-border text-muted-foreground hover:border-destructive/50 disabled:hover:border-border'
                      }`}
                    >
                      {option.name}
                    </button>
                  )) : <p className="text-xs text-muted-foreground italic">Loading options...</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Nutrition Goal */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />Current Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <select name="nutrition_goal" value={formData.nutrition_goal} onChange={handleInputChange} className="w-full h-9 px-3 text-sm border border-primary/30 rounded-md bg-white focus:ring-1 focus:ring-primary outline-none">
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="WEIGHT_LOSS">Weight Loss</option>
                  <option value="WEIGHT_GAIN">Weight Gain</option>
                </select>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-bold text-primary">
                    {formData.nutrition_goal ? formData.nutrition_goal.replace(/_/g, ' ') : 'Maintenance'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Based on this goal, our advisory system will suggest appropriate portions and alternatives.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-secondary" />Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{userData.tier} Tier</span>
                {userData.tier !== 'Ultra' && (
                  <Link to="/dashboard/subscription" className="text-xs text-primary hover:underline font-medium">Upgrade →</Link>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {userData.tier === 'Ultra' 
                  ? 'You have full access to all premium tracking and reporting features.'
                  : 'Upgrade to Ultra for daily tracking, weekly reports, and premium support.'}
              </p>
            </CardContent>
          </Card>

          {/* Privacy & Advisory */}
          <div className="p-5 bg-muted/30 rounded-xl border border-border space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Privacy & Safety
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile data is stored securely in our private backend. We use it only for rule-based nutrition guidance.
            </p>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed border-t border-border/50 pt-2">
              Mazaj+ is an advisory system. Always consult a healthcare professional for medical or diagnostic advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
