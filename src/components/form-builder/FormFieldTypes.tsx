'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Type, 
  Mail, 
  Phone, 
  FileText, 
  ToggleRight, 
  ToggleLeft, 
  Calendar,
  MapPin,
  Hash,
  Globe,
  User,
  Building,
  FileCheck
} from 'lucide-react';

export interface FormFieldType {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  defaultPlaceholder: string;
  defaultLabel: string;
  defaultFieldName: string;
  supportsOptions: boolean;
  supportsValidation: boolean;
  defaultWidth: string;
}

export const PREDEFINED_FIELD_TYPES: FormFieldType[] = [
  {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    description: 'Single line text input',
    defaultPlaceholder: 'Enter text...',
    defaultLabel: 'Text Field',
    defaultFieldName: 'text_field',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email address input with validation',
    defaultPlaceholder: 'Enter your email...',
    defaultLabel: 'Email Address',
    defaultFieldName: 'email',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'tel',
    label: 'Phone Number',
    icon: Phone,
    description: 'Phone number input',
    defaultPlaceholder: 'Enter your phone number...',
    defaultLabel: 'Phone Number',
    defaultFieldName: 'phone',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: FileText,
    description: 'Multi-line text input',
    defaultPlaceholder: 'Enter your message...',
    defaultLabel: 'Message',
    defaultFieldName: 'message',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'select',
    label: 'Select Dropdown',
    icon: ToggleRight,
    description: 'Dropdown selection with options',
    defaultPlaceholder: 'Select an option...',
    defaultLabel: 'Select Option',
    defaultFieldName: 'select_field',
    supportsOptions: true,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: ToggleLeft,
    description: 'Single checkbox input',
    defaultPlaceholder: '',
    defaultLabel: 'I agree to the terms',
    defaultFieldName: 'checkbox_field',
    supportsOptions: false,
    supportsValidation: false,
    defaultWidth: 'full'
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: ToggleLeft,
    description: 'Radio button group with options',
    defaultPlaceholder: '',
    defaultLabel: 'Select Option',
    defaultFieldName: 'radio_field',
    supportsOptions: true,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'date',
    label: 'Date Picker',
    icon: Calendar,
    description: 'Date selection input',
    defaultPlaceholder: 'Select a date...',
    defaultLabel: 'Date',
    defaultFieldName: 'date_field',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'number',
    label: 'Number Input',
    icon: Hash,
    description: 'Numeric input field',
    defaultPlaceholder: 'Enter a number...',
    defaultLabel: 'Number',
    defaultFieldName: 'number_field',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'url',
    label: 'Website URL',
    icon: Globe,
    description: 'Website URL input with validation',
    defaultPlaceholder: 'https://example.com',
    defaultLabel: 'Website',
    defaultFieldName: 'website',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'first_name',
    label: 'First Name',
    icon: User,
    description: 'First name input field',
    defaultPlaceholder: 'Enter your first name...',
    defaultLabel: 'First Name',
    defaultFieldName: 'first_name',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'half'
  },
  {
    type: 'last_name',
    label: 'Last Name',
    icon: User,
    description: 'Last name input field',
    defaultPlaceholder: 'Enter your last name...',
    defaultLabel: 'Last Name',
    defaultFieldName: 'last_name',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'half'
  },
  {
    type: 'company',
    label: 'Company',
    icon: Building,
    description: 'Company name input field',
    defaultPlaceholder: 'Enter your company name...',
    defaultLabel: 'Company',
    defaultFieldName: 'company',
    supportsOptions: false,
    supportsValidation: false,
    defaultWidth: 'full'
  },
  {
    type: 'street_address',
    label: 'Street Address',
    icon: MapPin,
    description: 'Street address line 1',
    defaultPlaceholder: '123 Main Street',
    defaultLabel: 'Street Address',
    defaultFieldName: 'street_address',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'full'
  },
  {
    type: 'address_line_2',
    label: 'Address Line 2',
    icon: MapPin,
    description: 'Apartment, suite, unit, etc.',
    defaultPlaceholder: 'Apt 4B, Suite 200, Unit 5 (optional)',
    defaultLabel: 'Address Line 2',
    defaultFieldName: 'address_line_2',
    supportsOptions: false,
    supportsValidation: false,
    defaultWidth: 'full'
  },
  {
    type: 'city',
    label: 'City',
    icon: MapPin,
    description: 'City name',
    defaultPlaceholder: 'Toronto',
    defaultLabel: 'City',
    defaultFieldName: 'city',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'half'
  },
  {
    type: 'province_state',
    label: 'Province/State',
    icon: MapPin,
    description: 'Province or State',
    defaultPlaceholder: 'ON',
    defaultLabel: 'Province/State',
    defaultFieldName: 'province_state',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'half'
  },
  {
    type: 'postal_code',
    label: 'Postal/Zip Code',
    icon: MapPin,
    description: 'Postal or ZIP code',
    defaultPlaceholder: 'M5V 3A8',
    defaultLabel: 'Postal/Zip Code',
    defaultFieldName: 'postal_code',
    supportsOptions: false,
    supportsValidation: true,
    defaultWidth: 'half'
  },
  {
    type: 'country',
    label: 'Country',
    icon: Globe,
    description: 'Country selection',
    defaultPlaceholder: 'Select country',
    defaultLabel: 'Country',
    defaultFieldName: 'country',
    supportsOptions: true,
    supportsValidation: true,
    defaultWidth: 'half'
  },
  {
    type: 'terms',
    label: 'Terms & Conditions',
    icon: FileCheck,
    description: 'Terms and conditions checkbox with modal',
    defaultPlaceholder: '',
    defaultLabel: 'I agree to the terms and conditions',
    defaultFieldName: 'terms_agreement',
    supportsOptions: true,
    supportsValidation: true,
    defaultWidth: 'full'
  }
];

interface FormFieldTypesProps {
  onFieldSelect: (fieldType: FormFieldType) => void;
  primaryColor?: string;
}

export default function FormFieldTypes({ onFieldSelect, primaryColor = '#5243E9' }: FormFieldTypesProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PREDEFINED_FIELD_TYPES.map((fieldType) => {
          const Icon = fieldType.icon;
          
          return (
            <Card
              key={fieldType.type}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-200"
              style={{
                borderColor: '#e5e7eb', // default gray-200
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${primaryColor}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              onClick={() => onFieldSelect(fieldType)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {fieldType.label}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {fieldType.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 