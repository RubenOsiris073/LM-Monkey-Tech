'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span className="ml-3 text-gray-600">Cargando modelos...</span>
    </div>
  );
}
