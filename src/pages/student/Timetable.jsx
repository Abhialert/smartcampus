import { useApp } from '../../contexts/AppContext';
import { Calendar, Download, Eye, FileText, Image } from 'lucide-react';
import { useState } from 'react';

export default function StudentTimetable() {
  const { timetables } = useApp();
  const [selectedImage, setSelectedImage] = useState(null);

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><Calendar className="w-6 h-6 text-red-500" /></div>
          Timetable
        </h1>
        <p className="text-gray-500 text-base mt-2 font-medium">View and download class timetables uploaded by the administration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {timetables.length > 0 ? timetables.map((tt) => (
          <div key={tt.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col">
            {tt.fileType === 'image' && tt.imageData ? (
              <div className="relative group/img cursor-pointer h-56" onClick={() => setSelectedImage(tt.imageData)}>
                <img src={tt.imageData} alt={tt.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center">
                  <Eye className="w-10 h-10 text-white opacity-0 group-hover/img:opacity-100 transition-all drop-shadow-md" />
                </div>
              </div>
            ) : (
              <div className="w-full h-56 bg-gray-50 flex flex-col items-center justify-center gap-4 border-b border-gray-100">
                <span className="text-6xl drop-shadow-sm">{getFileIcon(tt.fileType)}</span>
                <span className="text-base font-semibold text-gray-500 max-w-[80%] text-center truncate">{tt.fileName || 'Document'}</span>
              </div>
            )}
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-xl mb-2">{tt.label}</h3>
                {tt.dept && <p className="text-sm text-gray-500 font-medium">Department: <span className="text-gray-800">{tt.dept}</span> {tt.year ? `• Year ${tt.year}` : ''}</p>}
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Uploaded: {new Date(tt.uploadedAt).toLocaleDateString()}</p>
              </div>
              
              {tt.imageData && (
                <a 
                  href={tt.imageData} 
                  download={tt.fileName || 'timetable'} 
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors border border-red-100"
                >
                  <Download className="w-5 h-5" /> Download {tt.fileType === 'pdf' ? 'PDF' : tt.fileType === 'excel' ? 'Excel' : 'Image'}
                </a>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-2 bg-white rounded-2xl p-20 text-center border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-5" />
            <h3 className="text-xl font-bold text-gray-700">No timetables uploaded</h3>
            <p className="text-base text-gray-400 mt-2">Check back later for updated schedules.</p>
          </div>
        )}
      </div>

      {/* Fullscreen viewer for images */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Timetable" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white bg-black/50 hover:bg-red-500 rounded-full p-3 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-3 rounded-full text-white text-sm font-semibold backdrop-blur-md">
            Click anywhere to close
          </div>
        </div>
      )}
    </div>
  );
}
