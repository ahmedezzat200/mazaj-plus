import { useState, useEffect } from 'react';
import { profileApi, optionsApi, UserProfileData } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [healthOptions, setHealthOptions] = useState<{ id: number; name: string }[]>([]);
  const [allergyOptions, setAllergyOptions] = useState<{ id: number; name: string }[]>([]);
  
  const [loading, setLoading] = useState(true);
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
        setFormData({
          age: p.age?.toString() || '',
          gender: p.gender || '',
          height_cm: p.height_cm || '',
          weight_kg: p.weight_kg || '',
          nutrition_goal: p.nutrition_goal || '',
          health_conditions: p.health_conditions.map(hc => hc.health_condition_id),
          allergies: p.allergies.map(a => a.allergy_id),
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(null);
    setError(null);
  };

  const handleToggleOption = (type: 'health_conditions' | 'allergies', id: number) => {
    setFormData(prev => {
      const current = prev[type];
      const next = current.includes(id) 
        ? current.filter(i => i !== id) 
        : [...current, id];
      return { ...prev, [type]: next };
    });
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        height_cm: formData.height_cm || null,
        weight_kg: formData.weight_kg || null,
      };

      const res = await profileApi.updateMe(payload);
      if (res.ok) {
        setSuccess('Profile updated successfully.');
        setProfile(res.profile || null);
        await refreshUser(); // Refresh auth context user data
      } else {
        setError(res.error?.message || 'Please check the profile information and try again.');
      }
    } catch (err) {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
          {error}
          <button 
            onClick={fetchInitialData}
            className="ml-4 underline font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and health preferences.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Account Info (Read Only) */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="font-medium">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email Address</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Tier</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase">
                {user?.tier || 'Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Physical Profile */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Physical Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input 
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (cm)</label>
              <input 
                type="number"
                step="0.1"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <input 
                type="number"
                step="0.1"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="kg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Nutrition Goal</label>
              <select 
                name="nutrition_goal"
                value={formData.nutrition_goal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="MAINTENANCE">Maintenance</option>
                <option value="WEIGHT_LOSS">Weight Loss</option>
                <option value="WEIGHT_GAIN">Weight Gain</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health Conditions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Health Conditions
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Select all that apply to you for safe nutrition guidance.</p>
          <div className="flex flex-wrap gap-2">
            {healthOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleOption('health_conditions', option.id)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  formData.health_conditions.includes(option.id)
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-input-background border-border text-foreground hover:border-primary/50'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Allergies
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Select any allergies to help us filter out unsafe food recommendations.</p>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleOption('allergies', option.id)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  formData.allergies.includes(option.id)
                    ? 'bg-destructive border-destructive text-destructive-foreground'
                    : 'bg-input-background border-border text-foreground hover:border-destructive/50'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Saving Changes...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>

      <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-border">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Advisory Information
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The information provided here is used to tailor your nutrition decision support experience. Mazaj+ uses rule-based logic to identify potential risks based on your profile. However, this is not a substitute for professional medical advice. Always consult with a healthcare provider before making significant dietary changes.
        </p>
      </div>
    </div>
  );
}
