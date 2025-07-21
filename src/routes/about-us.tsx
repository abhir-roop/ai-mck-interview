import { Users } from "lucide-react";
import emailjs from "emailjs-com";
import { useState } from "react";

const AboutUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    message: ""
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Always send to your Gmail, but include sender's email as from_email
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        ...form,
        email: "why1wasteurtime@gmail.com", // always send to your Gmail
        from_email: form.email // sender's email for reply-to or template use
      },
      import.meta.env.VITE_EMAILJS_USER_ID
    ).then(() => {
      alert("Message sent to your Gmail!");
      setForm({ name: "", email: "", title: "", message: "" });
    }).catch(() => {
      alert("Failed to send message.");
    }).finally(() => {
      setSending(false);
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-emerald-50 to-white py-10 px-4">
      <div className="max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl p-12 flex flex-col items-center border border-emerald-100">
        <div className="bg-emerald-100 rounded-full p-5 mb-6 shadow-lg">
          <Users className="w-12 h-12 text-emerald-600" />
        </div>
        <h1 className="text-5xl font-extrabold text-emerald-700 mb-4 text-center drop-shadow-lg">About Us</h1>
        <p className="text-xl text-gray-700 mb-6 text-center font-medium">
          Welcome to <span className="font-bold text-emerald-600">AI Mock Interview</span> – your smart partner for interview success!
        </p>
        <p className="text-base text-gray-600 mb-4 text-center">
          Our mission is to empower you to ace real-world interviews with confidence. Leveraging advanced AI, we generate tailored questions, evaluate your answers, and deliver actionable feedback so you can grow and succeed.
        </p>
        <p className="text-base text-gray-600 mb-6 text-center">
          Whether you’re a student, job seeker, or professional, our platform is designed to make your interview practice effective, insightful, and stress-free.
        </p>
        <div className="w-full flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1 bg-emerald-50 rounded-xl p-6 text-center shadow">
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">AI-Driven Practice</h2>
            <p className="text-gray-600">Personalized questions and instant feedback for every skill level.</p>
          </div>
          <div className="flex-1 bg-blue-50 rounded-xl p-6 text-center shadow">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Real Results</h2>
            <p className="text-gray-600">Track your progress and boost your confidence with every session.</p>
          </div>
        </div>
        <span className="mt-8 text-emerald-700 font-semibold text-lg text-center">Thank you for choosing us as your interview partner!</span>

        <form className="w-full mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full px-4 py-3 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full px-4 py-3 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Subject / Title"
            className="w-full px-4 py-3 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            className="w-full px-4 py-3 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            rows={4}
            required
          />
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl shadow-lg font-bold hover:from-emerald-600 hover:to-blue-600"
            disabled={sending}
          >
            {sending ? "Sending..." : "Contact Us"}
          </button>
        </form>
      </div>
    </div>
  );
};


export default AboutUs;
