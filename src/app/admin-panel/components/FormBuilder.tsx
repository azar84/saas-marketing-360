'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  GripVertical,
  Settings,
  Eye,
  Copy,
  Check,
  Palette,
  Zap,
  Send,
  Calculator,
  Puzzle,
  Target,
  Grid3X3,
  Shield,
  Building2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Type
} from 'lucide-react';
import FormFieldTypes, { FormFieldType } from '@/components/form-builder/FormFieldTypes';
  import IconPicker from '@/components/ui/IconPicker';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDesignSystem } from '@/hooks/useDesignSystem';

interface FormField {
  id?: number;
  fieldType: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  fieldWidth: string;
  fieldOptions?: any;
  sortOrder: number;
}

interface Form {
  id?: number;
  name: string;
  title: string;
  subheading?: string;
  successMessage: string;
  errorMessage: string;
  fields: FormField[];
  
  // CTA Customization
  ctaText?: string;
  ctaIcon?: string;
  ctaStyle?: string;
  ctaSize?: string;
  ctaWidth?: string;
  ctaLoadingText?: string;
  
  // Enhanced CTA Colors
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaBorderColor?: string;
  ctaHoverBackgroundColor?: string;
  ctaHoverTextColor?: string;
  
  // Submission Actions
  redirectUrl?: string;
  emailNotification?: boolean;
  emailRecipients?: string;
  
  // Dynamic Email Recipients
  dynamicEmailRecipients?: boolean;
  emailFieldRecipients?: string;
  sendToSubmitterEmail?: boolean;
  submitterEmailField?: string;
  
  // Email Templates
  adminEmailSubject?: string;
  adminEmailTemplate?: string;
  submitterEmailSubject?: string;
  submitterEmailTemplate?: string;
  
  webhookUrl?: string;
  
  // Newsletter Action
  newsletterAction?: boolean;
  newsletterEmailField?: string;
  
  // Captcha Settings
  enableCaptcha?: boolean;
  captchaType?: string;
  captchaDifficulty?: string;
  
  // Contact Information
  showContactInfo?: boolean;
  contactPosition?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  
  // Social Media Links
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  
  // Contact Text Customization
  contactHeading?: string;
  contactSubheading?: string;
  contactPhoneLabel?: string;
  contactEmailLabel?: string;
  contactAddressLabel?: string;
  contactSocialLabel?: string;
  
  // Form Styling
  ctaPosition?: string;
  formBackgroundColor?: string;
  formBorderColor?: string;
  formTextColor?: string;
  fieldBackgroundColor?: string;
  fieldBorderColor?: string;
  fieldTextColor?: string;
  sectionBackgroundColor?: string;
}

// Sortable Field Item Component
function SortableFieldItem({ 
  field, 
  index, 
  onEdit, 
  onDelete,
  primaryColor
}: { 
  field: FormField; 
  index: number; 
  onEdit: (index: number) => void; 
  onDelete: (index: number) => void; 
  primaryColor: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `field-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-lg bg-white ${
        isDragging ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <span className="text-xs font-medium" style={{ color: primaryColor }}>
            {field.fieldType.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{field.label}</div>
          <div className="text-sm text-gray-500">{field.fieldName}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {field.isRequired && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">Required</span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(index)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Add ColorPicker component for design system colors
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  designSystemColors?: Array<{ name: string; value: string; description?: string }>;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, designSystemColors }) => {
  const [showPalette, setShowPalette] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div
          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="px-3"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
        {designSystemColors && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPalette(!showPalette)}
            className="px-3"
          >
            <Palette size={16} />
          </Button>
        )}
      </div>
      
      {/* Design System Color Palette */}
      {showPalette && designSystemColors && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <p className="text-xs font-medium text-gray-600 mb-2">Design System Colors</p>
          <div className="grid grid-cols-4 gap-2">
            {designSystemColors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange(color.value);
                  setShowPalette(false);
                }}
                className="group flex flex-col items-center p-2 rounded-lg hover:bg-white transition-colors"
                title={color.description || color.name}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs mt-1 text-gray-600 truncate max-w-full">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Add Button Style Preview component
interface ButtonStylePreviewProps {
  style: string;
  size: string;
  text: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: string;
}

const ButtonStylePreview: React.FC<ButtonStylePreviewProps> = ({
  style,
  size,
  text,
  backgroundColor,
  textColor,
  borderColor,
  icon
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'px-3 py-1.5 text-sm';
      case 'medium': return 'px-4 py-2 text-base';
      case 'large': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2 text-base';
    }
  };

  const getStyleClasses = () => {
    switch (style) {
      case 'primary':
        return 'font-semibold rounded-lg transition-all';
      case 'secondary':
        return 'font-medium rounded-lg border-2 transition-all';
      case 'outline':
        return 'font-medium rounded-lg border-2 bg-transparent transition-all';
      case 'ghost':
        return 'font-medium rounded-lg bg-transparent hover:bg-gray-100 transition-all';
      default:
        return 'font-medium rounded-lg transition-all';
    }
  };

  const getDefaultColors = () => {
    switch (style) {
      case 'primary':
        return {
          backgroundColor: backgroundColor || '#5243E9',
          color: textColor || '#FFFFFF',
          borderColor: 'transparent'
        };
      case 'secondary':
        return {
          backgroundColor: backgroundColor || '#6B7280',
          color: textColor || '#FFFFFF',
          borderColor: borderColor || '#6B7280'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: textColor || '#5243E9',
          borderColor: borderColor || '#5243E9'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: textColor || '#374151',
          borderColor: 'transparent'
        };
      default:
        return {
          backgroundColor: backgroundColor || '#5243E9',
          color: textColor || '#FFFFFF',
          borderColor: 'transparent'
        };
    }
  };

  const colors = getDefaultColors();

  // Get icon component dynamically
  const getIconComponent = () => {
    if (!icon) return null;
    
    try {
      // Import the icon from lucide-react dynamically
      const iconComponents = require('lucide-react');
      const IconComponent = iconComponents[icon];
      return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
    } catch {
      return null;
    }
  };

  return (
    <button
      type="button"
      className={`${getSizeClasses()} ${getStyleClasses()} pointer-events-none flex items-center justify-center gap-2`}
      style={{
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        borderColor: colors.borderColor
      }}
    >
      {getIconComponent()}
      <span>{text || 'Preview'}</span>
    </button>
  );
};

export default function FormBuilder() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Form>({
    name: '',
    title: '',
    subheading: '',
    successMessage: 'Thank you! Your message has been sent successfully.',
    errorMessage: 'Sorry, there was an error. Please try again.',
    fields: [],
    ctaText: 'Send Message',
    ctaIcon: 'send',
    ctaStyle: 'primary',
    ctaSize: 'large',
    ctaWidth: 'auto',
    ctaLoadingText: 'Sending...',
    enableCaptcha: true,
    captchaType: 'math',
    captchaDifficulty: 'medium',
    contactPosition: 'right',
    contactHeading: 'Get in Touch',
    contactSubheading: "We'd love to hear from you. Here's how you can reach us.",
    contactPhoneLabel: 'Phone',
    contactEmailLabel: 'Email',
    contactAddressLabel: 'Address',
    contactSocialLabel: 'Follow Us',
    formBorderColor: 'transparent' // Default to no border for new forms
  });
  const [fieldData, setFieldData] = useState<FormField>({
    fieldType: 'text',
    fieldName: '',
    label: '',
    placeholder: '',
    helpText: '',
    isRequired: false,
    fieldWidth: 'full',
    fieldOptions: null,
    sortOrder: 0
  });
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loadingSiteSettings, setLoadingSiteSettings] = useState(false);

  // Design System Integration
  const { designSystem } = useDesignSystem();

  // Get primary color for icons
  const getPrimaryColor = () => {
    return designSystem?.primaryColor || '#5243E9'; // fallback color
  };

  // Get design system colors for color picker
  const getDesignSystemColors = () => {
    if (!designSystem) return [];
    
    return [
      { name: 'Primary', value: designSystem.primaryColor, description: 'Main brand color' },
      { name: 'Primary Light', value: designSystem.primaryColorLight, description: 'Light primary variant' },
      { name: 'Primary Dark', value: designSystem.primaryColorDark, description: 'Dark primary variant' },
      { name: 'Secondary', value: designSystem.secondaryColor, description: 'Secondary brand color' },
      { name: 'Accent', value: designSystem.accentColor, description: 'Accent color' },
      { name: 'Success', value: designSystem.successColor, description: 'Success state color' },
      { name: 'Warning', value: designSystem.warningColor, description: 'Warning state color' },
      { name: 'Error', value: designSystem.errorColor, description: 'Error state color' },
      { name: 'Info', value: designSystem.infoColor, description: 'Info state color' },
      { name: 'Gray Dark', value: designSystem.grayDark, description: 'Dark gray' },
      { name: 'Gray Medium', value: designSystem.grayMedium, description: 'Medium gray' },
      { name: 'Text Primary', value: designSystem.textPrimary, description: 'Primary text color' },
      { name: 'Text Secondary', value: designSystem.textSecondary, description: 'Secondary text color' }
    ];
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchForms();
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const autoPopulateFromSiteSettings = (isEditing: boolean = false) => {
    if (!siteSettings) return;

    const contactData = {
      contactPhone: siteSettings.companyPhone || '',
      contactEmail: siteSettings.companyEmail || '',
      contactAddress: siteSettings.companyAddress || '',
      socialFacebook: siteSettings.socialFacebook || '',
      socialTwitter: siteSettings.socialTwitter || '',
      socialLinkedin: siteSettings.socialLinkedin || '',
      socialInstagram: siteSettings.socialInstagram || '',
      socialYoutube: siteSettings.socialYoutube || ''
    };

    if (isEditing && selectedForm) {
      setSelectedForm({
        ...selectedForm,
        ...contactData
      });
    } else {
      setFormData({
        ...formData,
        ...contactData
      });
    }
  };

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSelect = (fieldType: FormFieldType) => {
    const currentForm = selectedForm || formData;
    setFieldData({
      fieldType: fieldType.type,
      fieldName: fieldType.defaultFieldName,
      label: fieldType.defaultLabel,
      placeholder: fieldType.defaultPlaceholder,
      helpText: '',
      isRequired: false,
      fieldWidth: fieldType.defaultWidth,
      fieldOptions: fieldType.supportsOptions ? [] : null,
      sortOrder: currentForm?.fields.length || 0
    });
    
    // Initialize field options based on field type
    if (fieldType.type === 'select' || fieldType.type === 'radio') {
      setFieldOptions([]); // Start with empty options, user will add them
    } else if (fieldType.type === 'terms') {
      setTermsContent(''); // Start with empty terms content
    } else {
      setFieldOptions([]);
      setTermsContent('');
    }
    
    setShowFieldEditor(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const currentForm = selectedForm || formData;
    if (!currentForm) return;

    const activeIndex = parseInt(active.id.toString().replace('field-', ''));
    const overIndex = parseInt(over.id.toString().replace('field-', ''));

    const newFields = arrayMove(currentForm.fields, activeIndex, overIndex);
    
    // Update sortOrder for all fields
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      sortOrder: index
    }));

    if (selectedForm) {
      setSelectedForm({
        ...selectedForm,
        fields: updatedFields
      });
    } else {
      setFormData({
        ...formData,
        fields: updatedFields
      });
    }
  };

  const handleAddField = async () => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm) return;

    // Check for duplicate field names
    const existingFieldNames = currentForm.fields.map(field => field.fieldName.toLowerCase());
    if (fieldData.fieldName && existingFieldNames.includes(fieldData.fieldName.toLowerCase())) {
      alert(`A field with the name "${fieldData.fieldName}" already exists. Please use a different field name.`);
      return;
    }

    // Prepare field options based on field type
    let processedOptions = null;
    if (fieldData.fieldType === 'select' || fieldData.fieldType === 'radio') {
      processedOptions = fieldOptions.length > 0 ? fieldOptions : null;
    } else if (fieldData.fieldType === 'terms') {
      processedOptions = termsContent;
    }

    const newField = { 
      ...fieldData, 
      fieldOptions: processedOptions,
      sortOrder: currentForm.fields.length 
    };
    const updatedFields = [...(currentForm.fields || []), newField];
    
    if (selectedForm) {
      // Auto-save for existing forms
      try {
        const response = await fetch('/api/admin/forms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedForm.id,
        ...selectedForm,
        fields: updatedFields
          }),
        });

        if (response.ok) {
          setSelectedForm({ ...selectedForm, fields: updatedFields });
          await fetchForms(); // Refresh the forms list
        } else {
          alert('Failed to save new field');
          return;
        }
      } catch (error) {
        console.error('Error saving field:', error);
        alert('Failed to save new field');
        return;
      }
    } else {
      // Creating new form
      setFormData({
        ...formData,
        fields: updatedFields
      });
    }
    
    setShowFieldEditor(false);
    resetFieldEditor();
  };

  const handleEditField = (index: number) => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm) return;
    
    const field = currentForm.fields[index];
    setFieldData(field);
    
    // Load existing options based on field type
    if (field.fieldType === 'select' || field.fieldType === 'radio') {
      setFieldOptions(Array.isArray(field.fieldOptions) ? field.fieldOptions : []);
    } else if (field.fieldType === 'terms') {
      setTermsContent(field.fieldOptions || '');
    } else {
      setFieldOptions([]);
      setTermsContent('');
    }
    
    setEditingFieldIndex(index);
    setShowFieldEditor(true);
  };

  const handleUpdateField = async () => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm || editingFieldIndex === null) return;

    // Check for duplicate field names (excluding the current field being edited)
    const existingFieldNames = currentForm.fields
      .map((field, index) => ({ name: field.fieldName.toLowerCase(), index }))
      .filter(({ index }) => index !== editingFieldIndex)
      .map(({ name }) => name);
    
    if (fieldData.fieldName && existingFieldNames.includes(fieldData.fieldName.toLowerCase())) {
      alert(`A field with the name "${fieldData.fieldName}" already exists. Please use a different field name.`);
      return;
    }

    // Prepare field options based on field type
    let processedOptions = null;
    if (fieldData.fieldType === 'select' || fieldData.fieldType === 'radio') {
      processedOptions = fieldOptions.length > 0 ? fieldOptions : null;
    } else if (fieldData.fieldType === 'terms') {
      processedOptions = termsContent;
    }

    const updatedField = { 
      ...fieldData, 
      fieldOptions: processedOptions,
      sortOrder: editingFieldIndex 
    };

    const updatedFields = [...currentForm.fields];
    updatedFields[editingFieldIndex] = updatedField;
    
    if (selectedForm) {
      // Auto-save for existing forms
      try {
        const response = await fetch('/api/admin/forms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedForm.id,
        ...selectedForm,
        fields: updatedFields
          }),
        });

        if (response.ok) {
          setSelectedForm({ ...selectedForm, fields: updatedFields });
          await fetchForms(); // Refresh the forms list
        } else {
          alert('Failed to save field updates');
          return;
        }
      } catch (error) {
        console.error('Error saving field:', error);
        alert('Failed to save field updates');
        return;
      }
    } else {
      // Creating new form
      setFormData({
        ...formData,
        fields: updatedFields
      });
    }
    
    setShowFieldEditor(false);
    setEditingFieldIndex(null);
    resetFieldEditor();
  };

  const resetFieldEditor = () => {
    setFieldData({
      fieldType: 'text',
      fieldName: '',
      label: '',
      placeholder: '',
      helpText: '',
      isRequired: false,
      fieldWidth: 'full',
      fieldOptions: null,
      sortOrder: 0
    });
    setFieldOptions([]);
    setNewOption('');
    setTermsContent('');
  };

  const handleDeleteField = async (index: number) => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm) return;

    if (!confirm('Are you sure you want to delete this field?')) {
      return;
    }

    const updatedFields = currentForm.fields.filter((_, i) => i !== index);
    // Update sortOrder for remaining fields
    const reorderedFields = updatedFields.map((field, i) => ({
      ...field,
      sortOrder: i
    }));
    
    if (selectedForm) {
      // Auto-save for existing forms
      try {
        const response = await fetch('/api/admin/forms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedForm.id,
        ...selectedForm,
            fields: reorderedFields
          }),
        });

        if (response.ok) {
          setSelectedForm({ ...selectedForm, fields: reorderedFields });
          await fetchForms(); // Refresh the forms list
        } else {
          alert('Failed to delete field');
          return;
        }
      } catch (error) {
        console.error('Error deleting field:', error);
        alert('Failed to delete field');
        return;
      }
    } else {
      // Creating new form
      setFormData({
        ...formData,
        fields: reorderedFields
      });
    }
  };

  const handleSaveForm = async () => {
    // Use selectedForm for editing, formData for creating
    const formToSave = selectedForm || formData;
    
    if (!formToSave) return;

    try {
      const url = formToSave.id ? '/api/admin/forms' : '/api/admin/forms';
      const method = formToSave.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formToSave),
      });

      if (response.ok) {
        await fetchForms();
        setShowCreateForm(false);
        setSelectedForm(null);
        // Reset formData for next creation
        setFormData({
          name: '',
          title: '',
          subheading: '',
          successMessage: 'Thank you! Your message has been sent successfully.',
          errorMessage: 'Sorry, there was an error. Please try again.',
          fields: []
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save form');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    }
  };

  const handleDeleteForm = async (id: number) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/forms?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchForms();
        if (selectedForm?.id === id) {
          setSelectedForm(null);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldInputChange = (field: string, value: any) => {
    setFieldData(prev => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFieldOptions(prev => [...prev, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFieldOptions(prev => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setFieldOptions(prev => prev.map((option, i) => i === index ? value : option));
  };

  // Render sortable fields list
  const renderSortableFields = (fields: FormField[], isEditing: boolean = false) => {
    if (!fields || fields.length === 0) return null;

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Form Fields ({fields.length})</h3>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            Drag to reorder
          </div>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((_, index) => `field-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableFieldItem
                  key={`field-${index}`}
                  field={field}
                  index={index}
                  onEdit={handleEditField}
                  onDelete={handleDeleteField}
                  primaryColor={getPrimaryColor()}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-600">Create and manage custom forms with predefined field types</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
          Create New Form
        </Button>
      </div>

      {/* Forms List */}
      {!showCreateForm && !selectedForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                  <p className="text-sm text-gray-500">{form.name}</p>
                  {form.subheading && (
                    <p className="text-sm text-gray-600 mt-1">{form.subheading}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedForm(form)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteForm(form.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Editor */}
      {showCreateForm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create New Form</h2>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Form Details */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Form Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Contact Form, Lead Capture"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Get In Touch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subheading (Optional)
                </label>
                <Input
                  value={formData.subheading}
                  onChange={(e) => handleInputChange('subheading', e.target.value)}
                  placeholder="e.g., We'd love to hear from you"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Message
                </label>
                <Input
                  value={formData.successMessage}
                  onChange={(e) => handleInputChange('successMessage', e.target.value)}
                  placeholder="Message shown after successful submission"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Message
                </label>
                <Input
                  value={formData.errorMessage}
                  onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                  placeholder="Message shown when submission fails"
                />
              </div>
            </div>
          </Card>

          {/* Enhanced CTA Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" style={{ color: getPrimaryColor() }} />
              Submit Button (CTA) Configuration
            </h3>
            
            {/* Basic CTA Settings */}
            <div className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Button Text
                   </label>
                   <Input
                     value={formData.ctaText || 'Send Message'}
                     onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                     placeholder="e.g., Send Message, Submit, Get Started"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Button Icon
                   </label>
                   <IconPicker
                     value={formData.ctaIcon || ''}
                     onChange={(iconName) => setFormData({...formData, ctaIcon: iconName})}
                     placeholder="Select an icon (optional)"
                     showLabel={false}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Loading Text
                   </label>
                   <Input
                     value={formData.ctaLoadingText || 'Sending...'}
                     onChange={(e) => setFormData({...formData, ctaLoadingText: e.target.value})}
                     placeholder="e.g., Sending..., Processing..."
                   />
                 </div>
               </div>

              {/* Button Style Selection with Previews */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Button Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'primary', label: 'Primary', description: 'Filled button with gradient' },
                    { value: 'secondary', label: 'Secondary', description: 'Solid color button' },
                    { value: 'outline', label: 'Outline', description: 'Transparent with border' },
                    { value: 'ghost', label: 'Ghost', description: 'Minimal styling' }
                  ].map((style) => (
                    <div
                      key={style.value}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.ctaStyle === style.value
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={formData.ctaStyle === style.value ? { 
                        borderColor: getPrimaryColor(), 
                        backgroundColor: `${getPrimaryColor()}08` 
                      } : {}}
                      onClick={() => setFormData({...formData, ctaStyle: style.value})}
                    >
                      <div className="text-center space-y-2">
                                                 <ButtonStylePreview
                           style={style.value}
                           size={formData.ctaSize || 'medium'}
                           text="Preview"
                           backgroundColor={formData.ctaBackgroundColor}
                           textColor={formData.ctaTextColor}
                           borderColor={formData.ctaBorderColor}
                           icon={formData.ctaIcon}
                         />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{style.label}</p>
                          <p className="text-xs text-gray-500">{style.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Size and Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Size
                  </label>
                  <select
                    value={formData.ctaSize || 'large'}
                    onChange={(e) => setFormData({...formData, ctaSize: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Width
                  </label>
                  <select
                    value={formData.ctaWidth || 'auto'}
                    onChange={(e) => setFormData({...formData, ctaWidth: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="auto">Auto Width</option>
                    <option value="fixed">Fixed Width (256px)</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>
              </div>

              {/* CTA Color Customization */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Color Customization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Background Color"
                    value={formData.ctaBackgroundColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setFormData({...formData, ctaBackgroundColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={formData.ctaTextColor || '#FFFFFF'}
                    onChange={(color) => setFormData({...formData, ctaTextColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Border Color"
                    value={formData.ctaBorderColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setFormData({...formData, ctaBorderColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                </div>
                
                {/* Hover Colors */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Hover States</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Hover Background"
                      value={formData.ctaHoverBackgroundColor || (designSystem?.primaryColorDark || '#4338CA')}
                      onChange={(color) => setFormData({...formData, ctaHoverBackgroundColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                    <ColorPicker
                      label="Hover Text Color"
                      value={formData.ctaHoverTextColor || '#FFFFFF'}
                      onChange={(color) => setFormData({...formData, ctaHoverTextColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Live Preview</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center">
                                         <ButtonStylePreview
                       style={formData.ctaStyle || 'primary'}
                       size={formData.ctaSize || 'large'}
                       text={formData.ctaText || 'Send Message'}
                       backgroundColor={formData.ctaBackgroundColor}
                       textColor={formData.ctaTextColor}
                       borderColor={formData.ctaBorderColor}
                       icon={formData.ctaIcon}
                     />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Submission Actions Configuration */}
            <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2" style={{ color: getPrimaryColor() }} />
              Submission Actions
            </h3>
            
            <div className="space-y-6">
              {/* Redirect After Submission */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!formData.redirectUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, redirectUrl: ''});
                      } else {
                        const { redirectUrl, ...rest } = formData;
                        setFormData(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Redirect after successful submission
                        </span>
                </label>
                {formData.redirectUrl !== undefined && (
                  <Input
                    value={formData.redirectUrl}
                    onChange={(e) => setFormData({...formData, redirectUrl: e.target.value})}
                    placeholder="https://example.com/thank-you or /thank-you"
                    className="mt-2"
                  />
                )}
                      </div>

              {/* Email Notifications */}
                      <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.emailNotification || false}
                    onChange={(e) => setFormData({...formData, emailNotification: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send email notifications
                  </span>
                </label>
                                {formData.emailNotification && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Email notification settings can be configured after creating the form.
                    </p>
                      </div>
                )}
                    </div>

              {/* Newsletter Action */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.newsletterAction || false}
                    onChange={(e) => setFormData({...formData, newsletterAction: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Subscribe to newsletter
                  </span>
                </label>
                {formData.newsletterAction && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Field for Newsletter
                    </label>
                    <select
                      value={formData.newsletterEmailField || ''}
                      onChange={(e) => setFormData({...formData, newsletterEmailField: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="">Select the email field...</option>
                      {formData.fields?.filter(field => field.fieldType === 'email').map((field, index) => (
                        <option key={index} value={field.fieldName}>
                          {field.label} ({field.fieldName})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Purpose:</strong> Add the email address to your newsletter subscribers list
                    </p>
                    {formData.fields?.filter(field => field.fieldType === 'email').length === 0 && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          ⚠️ You need to add an email field to your form first
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Webhook Integration */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!formData.webhookUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, webhookUrl: ''});
                      } else {
                        const { webhookUrl, ...rest } = formData;
                        setFormData(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send data to webhook URL
                  </span>
                </label>
                {formData.webhookUrl !== undefined && (
                  <div className="mt-2">
                    <Input
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                      placeholder="https://api.example.com/webhook"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Form data will be sent as JSON POST request
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Information Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" style={{ color: getPrimaryColor() }} />
              Contact Information
            </h3>
            
            <div className="space-y-6">
              {/* Toggle Contact Info Display */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Show Contact Information</h4>
                  <p className="text-sm text-gray-500">Display contact details and social links with the form</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('showContactInfo', !formData.showContactInfo)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer bg-gray-300"
                  style={formData.showContactInfo ? { backgroundColor: getPrimaryColor() } : {}}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      formData.showContactInfo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                    </div>

              {/* Contact Information Fields */}
              {formData.showContactInfo && (
                <div className="space-y-4 border-t pt-4">
                  {/* Auto-populate button */}
                  {siteSettings && (siteSettings.companyPhone || siteSettings.companyEmail || siteSettings.companyAddress) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-blue-900">Auto-populate from Site Settings</h5>
                          <p className="text-xs text-blue-700">Fill contact information automatically from your site settings</p>
                        </div>
                      <Button
                          type="button"
                        variant="outline"
                        size="sm"
                          onClick={() => autoPopulateFromSiteSettings(false)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                          <Building2 className="w-4 h-4 mr-2" />
                          Auto-fill
                      </Button>
                    </div>
                  </div>
                  )}

                  {/* Contact Text Customization */}
                  <div className="space-y-4 border-b pb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Type className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                      Contact Section Text
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section Heading
                        </label>
                        <Input
                          value={formData.contactHeading || ''}
                          onChange={(e) => handleInputChange('contactHeading', e.target.value)}
                          placeholder="Get in Touch"
                        />
                  </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section Description
                        </label>
                        <Input
                          value={formData.contactSubheading || ''}
                          onChange={(e) => handleInputChange('contactSubheading', e.target.value)}
                          placeholder="We'd love to hear from you..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Label
                        </label>
                        <Input
                          value={formData.contactPhoneLabel || ''}
                          onChange={(e) => handleInputChange('contactPhoneLabel', e.target.value)}
                          placeholder="Phone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Label
                        </label>
                        <Input
                          value={formData.contactEmailLabel || ''}
                          onChange={(e) => handleInputChange('contactEmailLabel', e.target.value)}
                          placeholder="Email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Label
                        </label>
                        <Input
                          value={formData.contactAddressLabel || ''}
                          onChange={(e) => handleInputChange('contactAddressLabel', e.target.value)}
                          placeholder="Address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Social Media Label
                        </label>
                        <Input
                          value={formData.contactSocialLabel || ''}
                          onChange={(e) => handleInputChange('contactSocialLabel', e.target.value)}
                          placeholder="Follow Us"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                        Phone Number
                      </label>
                      <Input
                        value={formData.contactPhone || ''}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Mail className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                        Email Address
                      </label>
                      <Input
                        value={formData.contactEmail || ''}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                      Address
                    </label>
                    <Input
                      value={formData.contactAddress || ''}
                      onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  {/* Social Media Links */}
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Social Media Links</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Facebook className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          Facebook
                        </label>
                        <Input
                          value={formData.socialFacebook || ''}
                          onChange={(e) => handleInputChange('socialFacebook', e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Twitter className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          Twitter
                        </label>
                        <Input
                          value={formData.socialTwitter || ''}
                          onChange={(e) => handleInputChange('socialTwitter', e.target.value)}
                          placeholder="https://twitter.com/youraccount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Linkedin className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          LinkedIn
                        </label>
                        <Input
                          value={formData.socialLinkedin || ''}
                          onChange={(e) => handleInputChange('socialLinkedin', e.target.value)}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Instagram className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          Instagram
                        </label>
                        <Input
                          value={formData.socialInstagram || ''}
                          onChange={(e) => handleInputChange('socialInstagram', e.target.value)}
                          placeholder="https://instagram.com/youraccount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Youtube className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          YouTube
                        </label>
                        <Input
                          value={formData.socialYoutube || ''}
                          onChange={(e) => handleInputChange('socialYoutube', e.target.value)}
                          placeholder="https://youtube.com/yourchannel"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </Card>

          {/* Captcha Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" style={{ color: getPrimaryColor() }} />
              Captcha Security
            </h3>
            
            <div className="space-y-6">
              {/* Enable Captcha */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Captcha</h4>
                  <p className="text-sm text-gray-500">Add security verification to prevent spam submissions</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('enableCaptcha', !formData.enableCaptcha)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer bg-gray-300"
                  style={formData.enableCaptcha ? { backgroundColor: getPrimaryColor() } : {}}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      formData.enableCaptcha ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                    </div>

              {/* Captcha Configuration Options */}
              {formData.enableCaptcha && (
                <div className="space-y-4 border-t pt-4">
                  {/* Captcha Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Captcha Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'math', label: 'Math Problem', description: 'Simple arithmetic', icon: 'Calculator' },
                        { value: 'puzzle', label: 'Word Puzzle', description: 'Unscramble letters', icon: 'Puzzle' },
                        { value: 'drag', label: 'Drag & Drop', description: 'Interactive challenge', icon: 'Target' },
                        { value: 'image', label: 'Pattern Match', description: 'Visual recognition', icon: 'Grid3X3' }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            formData.captchaType === type.value
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={formData.captchaType === type.value ? { 
                            borderColor: getPrimaryColor(), 
                            backgroundColor: `${getPrimaryColor()}08` 
                          } : {}}
                          onClick={() => handleInputChange('captchaType', type.value)}
                        >
                          <div className="text-2xl mb-1 flex justify-center">
                            {type.icon === 'Calculator' && <Calculator className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                            {type.icon === 'Puzzle' && <Puzzle className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                            {type.icon === 'Target' && <Target className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                            {type.icon === 'Grid3X3' && <Grid3X3 className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                ))}
              </div>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'easy', label: 'Easy', description: 'Basic challenges', color: 'green' },
                        { value: 'medium', label: 'Medium', description: 'Moderate difficulty', color: 'yellow' },
                        { value: 'hard', label: 'Hard', description: 'Complex challenges', color: 'red' }
                      ].map((level) => (
                        <div
                          key={level.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            formData.captchaDifficulty === level.value
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={formData.captchaDifficulty === level.value ? { 
                            borderColor: getPrimaryColor(), 
                            backgroundColor: `${getPrimaryColor()}08` 
                          } : {}}
                          onClick={() => handleInputChange('captchaDifficulty', level.value)}
                        >
                          <p className="text-sm font-medium text-gray-900">{level.label}</p>
                          <p className="text-xs text-gray-500">{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Captcha Preview/Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Type:</strong> {formData.captchaType || 'math'} captcha</p>
                      <p><strong>Difficulty:</strong> {formData.captchaDifficulty || 'medium'}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        The captcha will appear after form fields and must be completed before submission.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Field Types */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Add Form Fields</h3>
            <FormFieldTypes onFieldSelect={handleFieldSelect} primaryColor={getPrimaryColor()} />
          </Card>

          {/* Fields List with Drag and Drop */}
          {renderSortableFields(formData.fields)}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveForm} disabled={!formData.name || !formData.title}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      )}

      {/* Form Editor - Edit Existing Form */}
      {selectedForm && !showCreateForm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Form: {selectedForm.title}</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setSelectedForm(null)}>
                <X className="h-4 w-4 mr-2" />
                Back to Forms
              </Button>
              <Button onClick={handleSaveForm}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Form Details */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Form Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name
                </label>
                <Input
                  value={selectedForm.name}
                  onChange={(e) => setSelectedForm({...selectedForm, name: e.target.value})}
                  placeholder="e.g., Contact Form, Lead Capture"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Title
                </label>
                <Input
                  value={selectedForm.title}
                  onChange={(e) => setSelectedForm({...selectedForm, title: e.target.value})}
                  placeholder="e.g., Get In Touch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subheading (Optional)
                </label>
                <Input
                  value={selectedForm.subheading || ''}
                  onChange={(e) => setSelectedForm({...selectedForm, subheading: e.target.value})}
                  placeholder="e.g., We'd love to hear from you"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Message
                </label>
                <Input
                  value={selectedForm.successMessage}
                  onChange={(e) => setSelectedForm({...selectedForm, successMessage: e.target.value})}
                  placeholder="Message shown after successful submission"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Message
                </label>
                <Input
                  value={selectedForm.errorMessage}
                  onChange={(e) => setSelectedForm({...selectedForm, errorMessage: e.target.value})}
                  placeholder="Message shown when submission fails"
                />
              </div>
            </div>
          </Card>

          {/* Enhanced CTA Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" style={{ color: getPrimaryColor() }} />
              Submit Button (CTA) Configuration
            </h3>
            
            {/* Basic CTA Settings */}
            <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Button Text
                 </label>
                 <Input
                   value={selectedForm.ctaText || 'Send Message'}
                   onChange={(e) => setSelectedForm({...selectedForm, ctaText: e.target.value})}
                   placeholder="e.g., Send Message, Submit, Get Started"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Button Icon
                 </label>
                 <IconPicker
                   value={selectedForm.ctaIcon || ''}
                   onChange={(iconName) => setSelectedForm({...selectedForm, ctaIcon: iconName})}
                   placeholder="Select an icon (optional)"
                   showLabel={false}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Loading Text
                 </label>
                 <Input
                   value={selectedForm.ctaLoadingText || 'Sending...'}
                   onChange={(e) => setSelectedForm({...selectedForm, ctaLoadingText: e.target.value})}
                   placeholder="e.g., Sending..., Processing..."
                 />
               </div>
             </div>

              {/* Button Style Selection with Previews */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Button Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'primary', label: 'Primary', description: 'Filled button with gradient' },
                    { value: 'secondary', label: 'Secondary', description: 'Solid color button' },
                    { value: 'outline', label: 'Outline', description: 'Transparent with border' },
                    { value: 'ghost', label: 'Ghost', description: 'Minimal styling' }
                  ].map((style) => (
                    <div
                      key={style.value}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedForm.ctaStyle === style.value
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={selectedForm.ctaStyle === style.value ? { 
                        borderColor: getPrimaryColor(), 
                        backgroundColor: `${getPrimaryColor()}08` 
                      } : {}}
                      onClick={() => setSelectedForm({...selectedForm, ctaStyle: style.value})}
                    >
                      <div className="text-center space-y-2">
                                                 <ButtonStylePreview
                           style={style.value}
                           size={selectedForm.ctaSize || 'medium'}
                           text="Preview"
                           backgroundColor={selectedForm.ctaBackgroundColor}
                           textColor={selectedForm.ctaTextColor}
                           borderColor={selectedForm.ctaBorderColor}
                           icon={selectedForm.ctaIcon}
                         />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{style.label}</p>
                          <p className="text-xs text-gray-500">{style.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Size and Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Size
                  </label>
                  <select
                    value={selectedForm.ctaSize || 'large'}
                    onChange={(e) => setSelectedForm({...selectedForm, ctaSize: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Width
                  </label>
                  <select
                    value={selectedForm.ctaWidth || 'auto'}
                    onChange={(e) => setSelectedForm({...selectedForm, ctaWidth: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="auto">Auto Width</option>
                    <option value="fixed">Fixed Width (256px)</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>
              </div>

              {/* CTA Color Customization */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Color Customization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Background Color"
                    value={selectedForm.ctaBackgroundColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setSelectedForm({...selectedForm, ctaBackgroundColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={selectedForm.ctaTextColor || '#FFFFFF'}
                    onChange={(color) => setSelectedForm({...selectedForm, ctaTextColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Border Color"
                    value={selectedForm.ctaBorderColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setSelectedForm({...selectedForm, ctaBorderColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                </div>
                
                {/* Hover Colors */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Hover States</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Hover Background"
                      value={selectedForm.ctaHoverBackgroundColor || (designSystem?.primaryColorDark || '#4338CA')}
                      onChange={(color) => setSelectedForm({...selectedForm, ctaHoverBackgroundColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                    <ColorPicker
                      label="Hover Text Color"
                      value={selectedForm.ctaHoverTextColor || '#FFFFFF'}
                      onChange={(color) => setSelectedForm({...selectedForm, ctaHoverTextColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Live Preview</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center">
                                         <ButtonStylePreview
                       style={selectedForm.ctaStyle || 'primary'}
                       size={selectedForm.ctaSize || 'large'}
                       text={selectedForm.ctaText || 'Send Message'}
                       backgroundColor={selectedForm.ctaBackgroundColor}
                       textColor={selectedForm.ctaTextColor}
                       borderColor={selectedForm.ctaBorderColor}
                       icon={selectedForm.ctaIcon}
                     />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Submission Actions Configuration */}
            <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2" style={{ color: getPrimaryColor() }} />
              Submission Actions
            </h3>
            
            <div className="space-y-6">
              {/* Redirect After Submission */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!selectedForm.redirectUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForm({...selectedForm, redirectUrl: ''});
                      } else {
                        const { redirectUrl, ...rest } = selectedForm;
                        setSelectedForm(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Redirect after successful submission
                        </span>
                </label>
                {selectedForm.redirectUrl !== undefined && (
                  <Input
                    value={selectedForm.redirectUrl}
                    onChange={(e) => setSelectedForm({...selectedForm, redirectUrl: e.target.value})}
                    placeholder="https://example.com/thank-you or /thank-you"
                    className="mt-2"
                  />
                )}
                      </div>

              {/* Email Notifications */}
                      <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedForm.emailNotification || false}
                    onChange={(e) => setSelectedForm({...selectedForm, emailNotification: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send email notifications
                  </span>
                </label>
                                {selectedForm.emailNotification && (
                  <div className="mt-2 space-y-4">
                    {/* Static Email Recipients */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Static Email Recipients (comma-separated)
                      </label>
                      <Input
                        value={selectedForm.emailRecipients || ''}
                        onChange={(e) => setSelectedForm({...selectedForm, emailRecipients: e.target.value})}
                        placeholder="admin@example.com, sales@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter email addresses separated by commas
                      </p>
                      </div>

                    {/* Email Recipients Configuration */}
                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                        <Mail className="w-4 h-4 mr-2" style={{ color: getPrimaryColor() }} />
                        Email Recipients
                      </h5>
                      
                      <div className="space-y-4">
                        

                        {/* Submitter Confirmation */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <label className="flex items-center space-x-2 mb-3">
                            <input
                              type="checkbox"
                              checked={selectedForm.sendToSubmitterEmail || false}
                              onChange={(e) => setSelectedForm({...selectedForm, sendToSubmitterEmail: e.target.checked})}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              ✅ Send confirmation email back to the person who submitted the form
                            </span>
                          </label>
                          
                          {selectedForm.sendToSubmitterEmail && (
                            <div className="ml-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Submitter's Email Field
                              </label>
                              <select
                                value={selectedForm.submitterEmailField || ''}
                                onChange={(e) => setSelectedForm({...selectedForm, submitterEmailField: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                              >
                                <option value="">Select the field containing submitter's email...</option>
                                {selectedForm.fields?.filter(field => field.fieldType === 'email').map((field, index) => (
                                  <option key={index} value={field.fieldName}>
                                    {field.label} ({field.fieldName})
                                  </option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                <strong>Purpose:</strong> Send a "thank you" confirmation email to the person who filled out the form
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                    </div>

              {/* Email Templates Configuration */}
              {selectedForm.emailNotification && (
                <div className="border-t pt-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Type className="w-4 h-4 mr-2" style={{ color: getPrimaryColor() }} />
                    Email Templates
                  </h4>
                  
                  <div className="space-y-6">
                    {/* Admin Email Template */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Admin Notification Email</h5>
              <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Line
                          </label>
                          <Input
                            value={selectedForm.adminEmailSubject || 'New Form Submission'}
                            onChange={(e) => setSelectedForm({...selectedForm, adminEmailSubject: e.target.value})}
                            placeholder="e.g., New Contact Form Submission"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Template
                          </label>
                          <textarea
                            value={selectedForm.adminEmailTemplate || 'You have received a new form submission.\n\n{{FORM_DATA}}\n\nSubmitted at: {{SUBMITTED_AT}}'}
                            onChange={(e) => setSelectedForm({...selectedForm, adminEmailTemplate: e.target.value})}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            placeholder="Enter your email template..."
                          />
                                                     <div className="mt-2 text-xs text-gray-500">
                             <p className="font-medium mb-1">Available variables:</p>
                             <div className="flex flex-wrap gap-2">
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{'{{FORM_DATA}}'}</span>
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{'{{SUBMITTED_AT}}'}</span>
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{'{{FORM_NAME}}'}</span>
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{'{{SUBMITTER_EMAIL}}'}</span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Submitter Confirmation Email Template */}
                    {selectedForm.sendToSubmitterEmail && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Submitter Confirmation Email</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject Line
                            </label>
                            <Input
                              value={selectedForm.submitterEmailSubject || 'Thank you for your submission'}
                              onChange={(e) => setSelectedForm({...selectedForm, submitterEmailSubject: e.target.value})}
                              placeholder="e.g., Thank you for contacting us!"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Template
                            </label>
                            <textarea
                              value={selectedForm.submitterEmailTemplate || 'Dear {{SUBMITTER_NAME}},\n\nThank you for contacting us! We have received your message and will get back to you soon.\n\nBest regards,\nThe Team'}
                              onChange={(e) => setSelectedForm({...selectedForm, submitterEmailTemplate: e.target.value})}
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                              placeholder="Enter your email template..."
                            />
                                                         <div className="mt-2 text-xs text-gray-500">
                               <p className="font-medium mb-1">Available variables:</p>
                               <div className="flex flex-wrap gap-2">
                                 <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{'{{SUBMITTER_NAME}}'}</span>
                                 <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{'{{SUBMITTER_EMAIL}}'}</span>
                                 <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{'{{FORM_NAME}}'}</span>
                                 <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{'{{SUBMITTED_AT}}'}</span>
                                 <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{'{{FORM_DATA}}'}</span>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template Preview */}
                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Template Preview</h5>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                        <p>Templates will be processed with actual form data when emails are sent.</p>
                                                 <p className="mt-1">Variables like {'{{FORM_DATA}}'} will be replaced with the actual submitted information.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter Action */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedForm.newsletterAction || false}
                    onChange={(e) => setSelectedForm({...selectedForm, newsletterAction: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Subscribe to newsletter
                  </span>
                </label>
                {selectedForm.newsletterAction && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Field for Newsletter
                    </label>
                    <select
                      value={selectedForm.newsletterEmailField || ''}
                      onChange={(e) => setSelectedForm({...selectedForm, newsletterEmailField: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="">Select the email field...</option>
                      {selectedForm.fields?.filter(field => field.fieldType === 'email').map((field, index) => (
                        <option key={index} value={field.fieldName}>
                          {field.label} ({field.fieldName})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Purpose:</strong> Add the email address to your newsletter subscribers list
                    </p>
                    {selectedForm.fields?.filter(field => field.fieldType === 'email').length === 0 && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          ⚠️ You need to add an email field to your form first
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Webhook Integration */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!selectedForm.webhookUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForm({...selectedForm, webhookUrl: ''});
                      } else {
                        const { webhookUrl, ...rest } = selectedForm;
                        setSelectedForm(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send data to webhook URL
                        </span>
                </label>
                {selectedForm.webhookUrl !== undefined && (
                  <div className="mt-2">
                    <Input
                      value={selectedForm.webhookUrl}
                      onChange={(e) => setSelectedForm({...selectedForm, webhookUrl: e.target.value})}
                      placeholder="https://api.example.com/webhook"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Form data will be sent as JSON POST request
                    </p>
                      </div>
                )}
              </div>
            </div>
          </Card>

          {/* Captcha Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" style={{ color: getPrimaryColor() }} />
              Captcha Security
            </h3>
            
            <div className="space-y-6">
              {/* Enable Captcha */}
              <div className="flex items-center justify-between">
                      <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Captcha</h4>
                  <p className="text-sm text-gray-500">Add security verification to prevent spam submissions</p>
                      </div>
                <button
                  type="button"
                  onClick={() => setSelectedForm({...selectedForm, enableCaptcha: !selectedForm.enableCaptcha})}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer bg-gray-300"
                  style={selectedForm.enableCaptcha ? { backgroundColor: getPrimaryColor() } : {}}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      selectedForm.enableCaptcha ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                    </div>

              {/* Captcha Configuration Options */}
              {selectedForm.enableCaptcha && (
                <div className="space-y-4 border-t pt-4">
                  {/* Captcha Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Captcha Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'math', label: 'Math Problem', description: 'Simple arithmetic', icon: 'Calculator' },
                        { value: 'puzzle', label: 'Word Puzzle', description: 'Unscramble letters', icon: 'Puzzle' },
                        { value: 'drag', label: 'Drag & Drop', description: 'Interactive challenge', icon: 'Target' },
                        { value: 'image', label: 'Pattern Match', description: 'Visual recognition', icon: 'Grid3X3' }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            selectedForm.captchaType === type.value
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={selectedForm.captchaType === type.value ? { 
                            borderColor: getPrimaryColor(), 
                            backgroundColor: `${getPrimaryColor()}08` 
                          } : {}}
                          onClick={() => setSelectedForm({...selectedForm, captchaType: type.value})}
                        >
                          <div className="text-2xl mb-1 flex justify-center">
                            {type.icon === 'Calculator' && <Calculator className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                            {type.icon === 'Puzzle' && <Puzzle className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                            {type.icon === 'Target' && <Target className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                            {type.icon === 'Grid3X3' && <Grid3X3 className="w-6 h-6" style={{ color: getPrimaryColor() }} />}
                    </div>
                          <p className="text-sm font-medium text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                ))}
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'easy', label: 'Easy', description: 'Basic challenges', color: 'green' },
                        { value: 'medium', label: 'Medium', description: 'Moderate difficulty', color: 'yellow' },
                        { value: 'hard', label: 'Hard', description: 'Complex challenges', color: 'red' }
                      ].map((level) => (
                        <div
                          key={level.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            selectedForm.captchaDifficulty === level.value
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={selectedForm.captchaDifficulty === level.value ? { 
                            borderColor: getPrimaryColor(), 
                            backgroundColor: `${getPrimaryColor()}08` 
                          } : {}}
                          onClick={() => setSelectedForm({...selectedForm, captchaDifficulty: level.value})}
                        >
                          <p className="text-sm font-medium text-gray-900">{level.label}</p>
                          <p className="text-xs text-gray-500">{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Captcha Preview/Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Type:</strong> {selectedForm.captchaType || 'math'} captcha</p>
                      <p><strong>Difficulty:</strong> {selectedForm.captchaDifficulty || 'medium'}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        The captcha will appear after form fields and must be completed before submission.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </Card>

          {/* Contact Information Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" style={{ color: getPrimaryColor() }} />
              Contact Information
            </h3>
            
            <div className="space-y-6">
              {/* Toggle Contact Info Display */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Show Contact Information</h4>
                  <p className="text-sm text-gray-500">Display contact details and social links with the form</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedForm({...selectedForm, showContactInfo: !selectedForm.showContactInfo})}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer bg-gray-300"
                  style={selectedForm.showContactInfo ? { backgroundColor: getPrimaryColor() } : {}}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      selectedForm.showContactInfo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Contact Information Fields */}
              {selectedForm.showContactInfo && (
                <div className="space-y-4 border-t pt-4">
                  {/* Contact Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information Position
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'left', label: 'Left', description: 'Left of form' },
                        { value: 'right', label: 'Right', description: 'Right of form' },
                        { value: 'top', label: 'Top', description: 'Above form' },
                        { value: 'bottom', label: 'Bottom', description: 'Below form' }
                      ].map((position) => (
                        <div
                          key={position.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            selectedForm.contactPosition === position.value
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={selectedForm.contactPosition === position.value ? { 
                            borderColor: getPrimaryColor(), 
                            backgroundColor: `${getPrimaryColor()}08` 
                          } : {}}
                          onClick={() => setSelectedForm({...selectedForm, contactPosition: position.value})}
                        >
                          <div className="text-sm font-medium text-gray-900">{position.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{position.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-populate button */}
                  {siteSettings && (siteSettings.companyPhone || siteSettings.companyEmail || siteSettings.companyAddress) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-blue-900">Auto-populate from Site Settings</h5>
                          <p className="text-xs text-blue-700">Fill contact information automatically from your site settings</p>
                        </div>
                      <Button
                          type="button"
                        variant="outline"
                        size="sm"
                          onClick={() => autoPopulateFromSiteSettings(true)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                          <Building2 className="w-4 h-4 mr-2" />
                          Auto-fill
                      </Button>
                    </div>
                  </div>
                  )}
                  
                  {/* Contact Text Customization */}
                  <div className="space-y-4 border-b pb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Type className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                      Contact Section Text
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section Heading
                        </label>
                        <Input
                          value={selectedForm.contactHeading || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, contactHeading: e.target.value})}
                          placeholder="Get in Touch"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section Description
                        </label>
                        <Input
                          value={selectedForm.contactSubheading || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, contactSubheading: e.target.value})}
                          placeholder="We'd love to hear from you..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Label
                        </label>
                        <Input
                          value={selectedForm.contactPhoneLabel || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, contactPhoneLabel: e.target.value})}
                          placeholder="Phone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Label
                        </label>
                        <Input
                          value={selectedForm.contactEmailLabel || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, contactEmailLabel: e.target.value})}
                          placeholder="Email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Label
                        </label>
                        <Input
                          value={selectedForm.contactAddressLabel || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, contactAddressLabel: e.target.value})}
                          placeholder="Address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Social Media Label
                        </label>
                        <Input
                          value={selectedForm.contactSocialLabel || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, contactSocialLabel: e.target.value})}
                          placeholder="Follow Us"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                        Phone Number
                      </label>
                      <Input
                        value={selectedForm.contactPhone || ''}
                        onChange={(e) => setSelectedForm({...selectedForm, contactPhone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Mail className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                        Email Address
                      </label>
                      <Input
                        value={selectedForm.contactEmail || ''}
                        onChange={(e) => setSelectedForm({...selectedForm, contactEmail: e.target.value})}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                      Address
                    </label>
                    <Input
                      value={selectedForm.contactAddress || ''}
                      onChange={(e) => setSelectedForm({...selectedForm, contactAddress: e.target.value})}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  {/* Social Media Links */}
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Social Media Links</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Facebook className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          Facebook
                        </label>
                        <Input
                          value={selectedForm.socialFacebook || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, socialFacebook: e.target.value})}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Twitter className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          Twitter
                        </label>
                        <Input
                          value={selectedForm.socialTwitter || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, socialTwitter: e.target.value})}
                          placeholder="https://twitter.com/youraccount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Linkedin className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          LinkedIn
                        </label>
                        <Input
                          value={selectedForm.socialLinkedin || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, socialLinkedin: e.target.value})}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Instagram className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          Instagram
                        </label>
                        <Input
                          value={selectedForm.socialInstagram || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, socialInstagram: e.target.value})}
                          placeholder="https://instagram.com/youraccount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Youtube className="h-4 w-4 mr-2" style={{ color: getPrimaryColor() }} />
                          YouTube
                        </label>
                        <Input
                          value={selectedForm.socialYoutube || ''}
                          onChange={(e) => setSelectedForm({...selectedForm, socialYoutube: e.target.value})}
                          placeholder="https://youtube.com/yourchannel"
                        />
                      </div>
                    </div>
                  </div>
                </div>
          )}
              </div>
            </Card>

          {/* Form Styling Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" style={{ color: getPrimaryColor() }} />
              Form Styling
            </h3>
            
            <div className="space-y-6">
              {/* Section Background Color */}
              <div>
                <ColorPicker
                  label="Section Background Color"
                  value={selectedForm.sectionBackgroundColor || (designSystem?.backgroundSecondary || '#F6F8FC')}
                  onChange={(color) => setSelectedForm({...selectedForm, sectionBackgroundColor: color})}
                  designSystemColors={getDesignSystemColors()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Background color for the entire form section
                </p>
              </div>
              
              {/* Form Container Colors */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Form Container</h4>
                
                {/* Show Border Toggle */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="text-sm font-medium text-gray-900">Show Border</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const isCurrentlyNoBorder = selectedForm.formBorderColor === 'transparent' || !selectedForm.formBorderColor;
                        setSelectedForm({
                          ...selectedForm, 
                          formBorderColor: isCurrentlyNoBorder ? `${getPrimaryColor()}20` : 'transparent'
                        });
                      }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer bg-gray-300"
                      style={(selectedForm.formBorderColor !== 'transparent' && selectedForm.formBorderColor) ? { backgroundColor: getPrimaryColor() } : {}}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          (selectedForm.formBorderColor !== 'transparent' && selectedForm.formBorderColor) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Add a border around the form container</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Background"
                    value={selectedForm.formBackgroundColor || (designSystem?.backgroundPrimary || '#FFFFFF')}
                    onChange={(color) => setSelectedForm({...selectedForm, formBackgroundColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  {(selectedForm.formBorderColor !== 'transparent' && selectedForm.formBorderColor) && (
                    <ColorPicker
                      label="Border"
                      value={selectedForm.formBorderColor || `${getPrimaryColor()}20`}
                      onChange={(color) => setSelectedForm({...selectedForm, formBorderColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                  )}
                  <ColorPicker
                    label="Text"
                    value={selectedForm.formTextColor || (designSystem?.textPrimary || '#1F2937')}
                    onChange={(color) => setSelectedForm({...selectedForm, formTextColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                </div>
              </div>
              
              {/* Form Fields Colors */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Form Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Background"
                    value={selectedForm.fieldBackgroundColor || '#FFFFFF'}
                    onChange={(color) => setSelectedForm({...selectedForm, fieldBackgroundColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Border"
                    value={selectedForm.fieldBorderColor || '#E5E7EB'}
                    onChange={(color) => setSelectedForm({...selectedForm, fieldBorderColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Text"
                    value={selectedForm.fieldTextColor || (designSystem?.textPrimary || '#1F2937')}
                    onChange={(color) => setSelectedForm({...selectedForm, fieldTextColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Field Types */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Add Form Fields</h3>
            <FormFieldTypes onFieldSelect={handleFieldSelect} primaryColor={getPrimaryColor()} />
          </Card>

          {/* Fields List with Drag and Drop */}
          {renderSortableFields(selectedForm.fields, true)}
        </div>
      )}

      {/* Field Editor Modal */}
      {showFieldEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Configure Field</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Label
                </label>
                <Input
                  value={fieldData.label}
                  onChange={(e) => handleFieldInputChange('label', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name
                </label>
                <Input
                  value={fieldData.fieldName}
                  onChange={(e) => handleFieldInputChange('fieldName', e.target.value)}
                />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <Input
                  value={fieldData.placeholder}
                  onChange={(e) => handleFieldInputChange('placeholder', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Help Text
                </label>
                <Input
                  value={fieldData.helpText}
                  onChange={(e) => handleFieldInputChange('helpText', e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative">
                <input
                  type="checkbox"
                  id="required"
                  checked={fieldData.isRequired}
                  onChange={(e) => handleFieldInputChange('isRequired', e.target.checked)}
                    className="h-4 w-4 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer relative"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  />
                  {fieldData.isRequired && (
                    <svg
                      className="absolute inset-0 h-4 w-4 text-white pointer-events-none"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <label htmlFor="required" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Required field
                </label>
              </div>

              {/* Options Management for Select and Radio Fields */}
              {(fieldData.fieldType === 'select' || fieldData.fieldType === 'radio') && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  
                  {/* Add New Option */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Enter option text"
                      onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    />
                    <Button onClick={addOption} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {fieldOptions.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {fieldOptions.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No options added yet</p>
                  )}
                </div>
              )}

              {/* Terms Content for Terms Field */}
              {fieldData.fieldType === 'terms' && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions Content
                  </label>
                  <textarea
                    value={termsContent}
                    onChange={(e) => setTermsContent(e.target.value)}
                    placeholder="Enter the full terms and conditions text that will be displayed in the modal..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This content will be displayed in a modal when users click "Read Terms"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowFieldEditor(false)}>
                Cancel
              </Button>
              <Button onClick={editingFieldIndex !== null ? handleUpdateField : handleAddField}>
                {editingFieldIndex !== null ? 'Update' : 'Add'} Field
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 