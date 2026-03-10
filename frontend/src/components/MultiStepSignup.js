import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ChevronRight, ChevronLeft, Check, User, Mail, Phone, Briefcase, GraduationCap } from 'lucide-react';

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Education', icon: GraduationCap },
];

export function MultiStepSignup({ onSubmit, loading, error }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Contact Details
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Step 3: Education
    highestEducation: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: '',
    additionalEducation: '',
  });

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
      case 2:
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
        break;
      case 3:
        if (!formData.highestEducation) newErrors.highestEducation = 'Highest education is required';
        if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
        if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = 'Field of study is required';
        if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      // Prepare final data (exclude confirmPassword)
      const { confirmPassword, ...submitData } = formData;
      onSubmit(submitData);
    }
  };

  const getStepProgress = () => {
    return (currentStep / steps.length) * 100;
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-start mb-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium hidden md:block text-center ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mt-5 ${
                    isCompleted ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-5 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-sm text-gray-500">Let's start with your basic details</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.password ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.confirmPassword ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {currentStep === 2 && (
          <div className="space-y-5 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Details</h2>
              <p className="text-sm text-gray-500">How can we reach you?</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.phone ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternatePhone" className="text-sm font-medium text-gray-700">
                    Alternate Phone (Optional)
                  </Label>
                  <Input
                    id="alternatePhone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.alternatePhone}
                    onChange={(e) => handleChange('alternatePhone', e.target.value)}
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter your street address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                  className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 ${
                    errors.address ? 'border-red-300' : ''
                  }`}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.city ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State/Province <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.state ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                    Zip Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.zipCode ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.zipCode && <p className="text-sm text-red-600">{errors.zipCode}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Education */}
        {currentStep === 3 && (
          <div className="space-y-5 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Education Details</h2>
              <p className="text-sm text-gray-500">Share your educational background</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="highestEducation" className="text-sm font-medium text-gray-700">
                    Highest Education Level <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="highestEducation"
                    value={formData.highestEducation}
                    onChange={(e) => handleChange('highestEducation', e.target.value)}
                    className={`w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 transition-all ${
                      errors.highestEducation ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select education level</option>
                    <option value="high-school">High School</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.highestEducation && <p className="text-sm text-red-600">{errors.highestEducation}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-sm font-medium text-gray-700">
                    Institution Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institution"
                    type="text"
                    placeholder="Enter institution name"
                    value={formData.institution}
                    onChange={(e) => handleChange('institution', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.institution ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.institution && <p className="text-sm text-red-600">{errors.institution}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy" className="text-sm font-medium text-gray-700">
                    Field of Study <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fieldOfStudy"
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.fieldOfStudy ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.fieldOfStudy && <p className="text-sm text-red-600">{errors.fieldOfStudy}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear" className="text-sm font-medium text-gray-700">
                    Graduation Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    placeholder="YYYY"
                    min="1950"
                    max={new Date().getFullYear() + 5}
                    value={formData.graduationYear}
                    onChange={(e) => handleChange('graduationYear', e.target.value)}
                    className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 h-11 ${
                      errors.graduationYear ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.graduationYear && <p className="text-sm text-red-600">{errors.graduationYear}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalEducation" className="text-sm font-medium text-gray-700">
                  Additional Education/Certifications (Optional)
                </Label>
                <Textarea
                  id="additionalEducation"
                  placeholder="List any additional degrees, certifications, or courses"
                  value={formData.additionalEducation}
                  onChange={(e) => handleChange('additionalEducation', e.target.value)}
                  rows={3}
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="rounded-lg h-11 px-6 border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="rounded-lg h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="rounded-lg h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

