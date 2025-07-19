const Services = () => (
  <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-white py-10 px-4">
    <div className="max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl p-12 flex flex-col items-center border border-blue-100">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-4 text-center drop-shadow-lg">Our Services</h1>
      <p className="text-xl text-gray-700 mb-6 text-center font-medium">
        Explore the range of services we offer to help you ace your interviews and grow your career.
      </p>
      <ul className="w-full space-y-6">
        <li className="bg-blue-50 rounded-xl p-6 shadow text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">AI Mock Interviews</h2>
          <p className="text-gray-600">Practice with AI-generated questions and get instant feedback.</p>
        </li>
        <li className="bg-emerald-50 rounded-xl p-6 shadow text-center">
          <h2 className="text-2xl font-bold text-emerald-700 mb-2">Personalized Feedback</h2>
          <p className="text-gray-600">Receive actionable insights to improve your answers and confidence.</p>
        </li>
        <li className="bg-blue-50 rounded-xl p-6 shadow text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Progress Tracking</h2>
          <p className="text-gray-600">Monitor your growth and see your improvement over time.</p>
        </li>
      </ul>
    </div>
  </div>
);

export default Services;
