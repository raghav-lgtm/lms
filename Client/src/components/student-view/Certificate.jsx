import React from 'react';

const Certificate = React.forwardRef(({ studentName, courseTitle, date }, ref) => {
  return (
    <div 
      ref={ref} 
      id="certificate-view" 
      className="absolute top-[-9999px] left-[-9999px] bg-white text-slate-800 flex flex-col items-center justify-center text-center" 
      style={{
        width: '1122px', // A4 landscape at 96 DPI
        height: '793px',
        border: '20px solid #1e293b',
        padding: '50px',
        fontFamily: 'Georgia, serif',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="w-full h-full flex flex-col items-center justify-center" 
        style={{ border: '5px double #1e293b', padding: '60px', boxSizing: 'border-box' }}
      >
        <div className="mb-4">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        <h1 className="text-6xl font-extrabold mb-4 tracking-tight">CERTIFICATE OF COMPLETION</h1>
        
        <p className="text-2xl tracking-[0.2em] mb-12 text-slate-500 uppercase">Proudly Presented To</p>
        
        <h2 className="text-5xl font-bold text-blue-700 mb-8 border-b-2 border-blue-700 pb-4 min-w-[500px]">
          {studentName || "Student Name"}
        </h2>
        
        <p className="text-2xl mb-12 text-slate-600">
          has successfully completed the course
        </p>
        
        <h3 className="text-4xl font-bold mb-16 px-16 leading-tight max-w-[900px]">
          {courseTitle || "Course Title"}
        </h3>
        
        <div className="flex justify-between w-[80%] mt-auto">
          <div className="text-center flex flex-col items-center">
            <p className="text-2xl border-b border-slate-800 pb-2 w-[200px]">
              {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
            <p className="text-xl mt-4 text-slate-500 uppercase tracking-widest">Date</p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="text-4xl border-b border-slate-800 pb-2 w-[250px]" style={{ fontFamily: '"Brush Script MT", cursive, font-style: italic' }}>
              EduHub
            </div>
            <p className="text-xl mt-4 text-slate-500 uppercase tracking-widest">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Certificate;
