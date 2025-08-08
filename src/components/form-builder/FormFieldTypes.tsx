import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Icons from 'lucide-react';

export interface FormFieldType {
  type: string;
  label: string;
  description: string;
  icon: string;
  hasOptions: boolean;
  hasPlaceholder: boolean;
  hasHelpText: boolean;
  hasValidation: boolean;
  defaultFieldName: string;
  defaultLabel: string;
  defaultPlaceholder: string;
  defaultWidth: string;
  supportsOptions: boolean;
}

const fieldTypes: FormFieldType[] = [
  {
    type: 'text',
    label: 'Text Input',
    description: 'Single line text input',
    icon: 'Type',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'text_field',
    defaultLabel: 'Text Input',
    defaultPlaceholder: 'Enter text...',
    defaultWidth: 'full',
    supportsOptions: false,
  },
  {
    type: 'textarea',
    label: 'Text Area',
    description: 'Multi-line text input',
    icon: 'AlignLeft',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'textarea_field',
    defaultLabel: 'Text Area',
    defaultPlaceholder: 'Enter your message...',
    defaultWidth: 'full',
    supportsOptions: false,
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address input',
    icon: 'Mail',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'email_field',
    defaultLabel: 'Email Address',
    defaultPlaceholder: 'Enter your email...',
    defaultWidth: 'full',
    supportsOptions: false,
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Phone number input',
    icon: 'Phone',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'phone_field',
    defaultLabel: 'Phone Number',
    defaultPlaceholder: 'Enter your phone number...',
    defaultWidth: 'full',
    supportsOptions: false,
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input',
    icon: 'Hash',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'number_field',
    defaultLabel: 'Number',
    defaultPlaceholder: 'Enter a number...',
    defaultWidth: 'half',
    supportsOptions: false,
  },
  {
    type: 'url',
    label: 'URL',
    description: 'Website URL input',
    icon: 'Link',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'url_field',
    defaultLabel: 'Website URL',
    defaultPlaceholder: 'Enter your website URL...',
    defaultWidth: 'full',
    supportsOptions: false,
  },
  {
    type: 'select',
    label: 'Dropdown',
    description: 'Select from options',
    icon: 'ChevronDown',
    hasOptions: true,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'select_field',
    defaultLabel: 'Select Option',
    defaultPlaceholder: 'Choose an option...',
    defaultWidth: 'full',
    supportsOptions: true,
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    description: 'Single choice from options',
    icon: 'Circle',
    hasOptions: true,
    hasPlaceholder: false,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'radio_field',
    defaultLabel: 'Select One',
    defaultPlaceholder: '',
    defaultWidth: 'full',
    supportsOptions: true,
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Multiple choice from options',
    icon: 'CheckSquare',
    hasOptions: true,
    hasPlaceholder: false,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'checkbox_field',
    defaultLabel: 'Select All That Apply',
    defaultPlaceholder: '',
    defaultWidth: 'full',
    supportsOptions: true,
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: 'Calendar',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'date_field',
    defaultLabel: 'Date',
    defaultPlaceholder: 'Select a date...',
    defaultWidth: 'half',
    supportsOptions: false,
  },
  {
    type: 'time',
    label: 'Time',
    description: 'Time picker',
    icon: 'Clock',
    hasOptions: false,
    hasPlaceholder: true,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'time_field',
    defaultLabel: 'Time',
    defaultPlaceholder: 'Select a time...',
    defaultWidth: 'half',
    supportsOptions: false,
  },
  {
    type: 'file',
    label: 'File Upload',
    description: 'File upload input',
    icon: 'Upload',
    hasOptions: false,
    hasPlaceholder: false,
    hasHelpText: true,
    hasValidation: true,
    defaultFieldName: 'file_field',
    defaultLabel: 'File Upload',
    defaultPlaceholder: '',
    defaultWidth: 'full',
    supportsOptions: false,
  },
  {
    type: 'hidden',
    label: 'Hidden Field',
    description: 'Hidden form field',
    icon: 'EyeOff',
    hasOptions: false,
    hasPlaceholder: false,
    hasHelpText: false,
    hasValidation: false,
    defaultFieldName: 'hidden_field',
    defaultLabel: 'Hidden Field',
    defaultPlaceholder: '',
    defaultWidth: 'full',
    supportsOptions: false,
  },
];

interface FormFieldTypesProps {
  onFieldSelect: (fieldType: FormFieldType) => void;
  primaryColor: string;
}

const FormFieldTypes: React.FC<FormFieldTypesProps> = ({ onFieldSelect, primaryColor }) => {
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Icons.Type className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {fieldTypes.map((fieldType) => (
        <Card
          key={fieldType.type}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
          onClick={() => onFieldSelect(fieldType)}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <div style={{ color: primaryColor }}>
                {getIconComponent(fieldType.icon)}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{fieldType.label}</h4>
              <p className="text-xs text-gray-500">{fieldType.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FormFieldTypes;
