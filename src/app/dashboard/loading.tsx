"use client";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-64 bg-white border-r flex-col p-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex-1 p-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
