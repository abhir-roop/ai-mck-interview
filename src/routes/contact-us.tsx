import React, { useState } from "react";
import emailjs from "emailjs-com";

const ContactUs = () => {
  const [form, setForm] = useState({ message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await emailjs.send(
        "service_ks3f6f4", // replace with your EmailJS service ID
        "template_t00cqa9", // replace with your EmailJS template ID
        {
          message: form.message,
        },
        "M5GeYP7xjciR3DvhN" // replace with your EmailJS public key
      );
      setSubmitted(true);
    } catch (error) {
      alert("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      {submitted ? (
        <div className="text-green-600 font-semibold">Thank you for contacting us! We will get back to you soon.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={5}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 font-semibold"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactUs;
