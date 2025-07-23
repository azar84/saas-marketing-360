import IconPickerExample from '../../components/ui/IconPickerExample';

// Force dynamic rendering - ensures SSR
export const dynamic = 'force-dynamic';

export default function TestIconPickerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Universal Icon Picker Demo</h1>
        <IconPickerExample />
      </div>
    </div>
  );
} 