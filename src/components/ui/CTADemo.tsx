import React, { useState } from 'react';
import { 
  Button, 
  IconButton, 
  LinkButton, 
  ActionGroup, 
  FloatingActionButton, 
  ProgressButton, 
  SplitButton 
} from './index';
import { 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Eye, 
  Settings, 
  ExternalLink,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

export const CTADemo: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleProgressDemo = () => {
    setIsLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="p-8 space-y-12" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          CTA Components Library
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          A comprehensive collection of Call-to-Action components for the admin panel
        </p>
      </div>

      {/* Basic Button Variants */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Button Variants
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="success">Success</Button>
          <Button variant="info">Info</Button>
        </div>
      </section>

      {/* Button Sizes */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Button Sizes
        </h2>
        <div className="flex items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </section>

      {/* IconButton Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Icon Buttons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <IconButton variant="primary" size="md">
            <Plus className="h-4 w-4" />
          </IconButton>
          <IconButton variant="secondary" size="md">
            <Edit className="h-4 w-4" />
          </IconButton>
          <IconButton variant="destructive" size="md">
            <Trash2 className="h-4 w-4" />
          </IconButton>
          <IconButton variant="ghost" size="md">
            <Eye className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <IconButton variant="primary" size="sm">
            <Plus className="h-3 w-3" />
          </IconButton>
          <IconButton variant="primary" size="lg">
            <Plus className="h-5 w-5" />
          </IconButton>
          <IconButton variant="primary" size="xl">
            <Plus className="h-6 w-6" />
          </IconButton>
        </div>
      </section>

      {/* LinkButton Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Link Buttons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LinkButton href="/dashboard" variant="primary" showArrow>
            Go to Dashboard
          </LinkButton>
          <LinkButton 
            href="https://example.com" 
            variant="outline" 
            external
            leftIcon={<ExternalLink className="h-4 w-4" />}
          >
            External Link
          </LinkButton>
          <LinkButton href="/settings" variant="ghost" leftIcon={<Settings className="h-4 w-4" />}>
            Settings
          </LinkButton>
        </div>
      </section>

      {/* ActionGroup Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Action Groups
        </h2>
        <div className="space-y-6">
          <ActionGroup orientation="horizontal" spacing="md" justify="between">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Save</Button>
          </ActionGroup>
          
          <ActionGroup orientation="horizontal" spacing="lg" justify="center">
            <Button variant="ghost" size="sm">Back</Button>
            <Button variant="outline" size="sm">Save Draft</Button>
            <Button variant="primary" size="sm">Publish</Button>
          </ActionGroup>
          
          <ActionGroup orientation="vertical" spacing="sm" align="start">
            <Button variant="outline" fullWidth>Option 1</Button>
            <Button variant="outline" fullWidth>Option 2</Button>
            <Button variant="outline" fullWidth>Option 3</Button>
          </ActionGroup>
        </div>
      </section>

      {/* ProgressButton Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Progress Buttons
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ProgressButton 
              variant="primary" 
              progress={progress}
              isLoading={isLoading}
              loadingText="Processing..."
              onClick={handleProgressDemo}
            >
              Start Progress
            </ProgressButton>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Progress: {progress}%
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <ProgressButton 
              variant="success" 
              progress={75}
              showProgressBar={true}
              leftIcon={<Upload className="h-4 w-4" />}
            >
              Upload Files
            </ProgressButton>
            
            <ProgressButton 
              variant="info" 
              progress={45}
              showProgressBar={true}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download Data
            </ProgressButton>
          </div>
        </div>
      </section>

      {/* SplitButton Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Split Buttons
        </h2>
        <div className="space-y-4">
          <SplitButton
            variant="primary"
            mainAction={{
              label: "Export",
              onClick: () => console.log("Export clicked"),
              icon: <Download className="h-4 w-4" />
            }}
            options={[
              {
                label: "Export as CSV",
                onClick: () => console.log("CSV export"),
                icon: <Download className="h-4 w-4" />
              },
              {
                label: "Export as JSON",
                onClick: () => console.log("JSON export"),
                icon: <Download className="h-4 w-4" />
              },
              {
                label: "Export as PDF",
                onClick: () => console.log("PDF export"),
                icon: <Download className="h-4 w-4" />
              }
            ]}
          />
          
          <SplitButton
            variant="destructive"
            mainAction={{
              label: "Delete",
              onClick: () => console.log("Delete clicked"),
              icon: <Trash2 className="h-4 w-4" />
            }}
            options={[
              {
                label: "Delete Selected",
                onClick: () => console.log("Delete selected"),
                variant: "destructive"
              },
              {
                label: "Delete All",
                onClick: () => console.log("Delete all"),
                variant: "destructive"
              }
            ]}
          />
        </div>
      </section>

      {/* FloatingActionButton Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Floating Action Buttons
        </h2>
        <div className="relative h-32 border-2 border-dashed rounded-lg flex items-center justify-center" style={{ borderColor: 'var(--color-gray-light)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>FABs are positioned relative to this container</p>
          
          <FloatingActionButton
            variant="primary"
            size="md"
            position="bottom-right"
            tooltip="Add new item"
            showTooltip={true}
            onClick={() => console.log("Add clicked")}
          >
            <Plus className="h-5 w-5" />
          </FloatingActionButton>
          
          <FloatingActionButton
            variant="secondary"
            size="sm"
            position="top-right"
            tooltip="Quick settings"
            showTooltip={true}
            onClick={() => console.log("Settings clicked")}
          >
            <Settings className="h-4 w-4" />
          </FloatingActionButton>
        </div>
      </section>

      {/* Real-world Usage Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Real-world Usage Examples
        </h2>
        
        {/* Data Table Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Data Table Row Actions
          </h3>
          <div className="flex items-center gap-2">
            <IconButton variant="ghost" size="sm" title="View">
              <Eye className="h-4 w-4" />
            </IconButton>
            <IconButton variant="outline" size="sm" title="Edit">
              <Edit className="h-4 w-4" />
            </IconButton>
            <IconButton variant="destructive" size="sm" title="Delete">
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        {/* Form Actions */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Form Actions
          </h3>
          <ActionGroup orientation="horizontal" spacing="md" justify="end">
            <Button variant="outline">Cancel</Button>
            <Button variant="ghost">Save Draft</Button>
            <Button variant="primary">Submit</Button>
          </ActionGroup>
        </div>

        {/* Bulk Actions */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Bulk Actions
          </h3>
          <SplitButton
            variant="primary"
            mainAction={{
              label: "Bulk Actions",
              onClick: () => console.log("Bulk action clicked")
            }}
            options={[
              {
                label: "Export Selected",
                onClick: () => console.log("Export selected"),
                icon: <Download className="h-4 w-4" />
              },
              {
                label: "Delete Selected",
                onClick: () => console.log("Delete selected"),
                icon: <Trash2 className="h-4 w-4" />,
                variant: "destructive"
              }
            ]}
          />
        </div>
      </section>
    </div>
  );
};

export default CTADemo;
