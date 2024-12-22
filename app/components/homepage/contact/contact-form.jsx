"use client";

import { isValidEmail } from "@/utils/check-email";
import axios from "axios";
import { useState } from "react";
import { TbMailForward } from "react-icons/tb";
import { toast } from "react-toastify";

function ContactForm() {
  const [error, setError] = useState({ email: false, required: false });
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    message: "",
  });

  const checkRequired = () => {
    if (userInput.email && userInput.message && userInput.name) {
      setError({ ...error, required: false });
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();

    if (!userInput.email || !userInput.message || !userInput.name) {
      setError({ ...error, required: true });
      return;
    } else if (error.email) {
      return;
    } else {
      setError({ ...error, required: false });
    }

    try {
      setIsLoading(true);
      const res = await axios.post("/api/contact", {
        ...userInput,
        notifyViaTelegram: true,
        notifyViaEmail: true,
      });

      if (res.data.success) {
        toast.success("Message sent! I&apos;ll get back to you soon via email.");
        setUserInput({
          name: "",
          email: "",
          message: "",
        });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error(
        "Failed to send message. Please try again or contact me directly at adityaraj3458@gmail.com"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-medium mb-5 text-[#16f2b3] text-xl uppercase">
        Let&apos;s Connect!
      </h2>
      <div className="max-w-3xl text-white rounded-lg border border-[#464c6a] p-3 lg:p-5">
        <p className="text-sm text-[#d3d8e8]">
          I&apos;m always interested in hearing about new projects and opportunities.
          Whether you have a question, want to collaborate, or just want to say
          hi - I&apos;d love to hear from you!
        </p>
        <form onSubmit={handleSendMail} className="mt-6 flex flex-col gap-4">
          {/* Rest of the form JSX remains the same */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-base">
              Name
            </label>
            <input
              id="name"
              className="bg-[#10172d] w-full border rounded-md border-[#353a52] focus:border-[#16f2b3] ring-0 outline-0 transition-all duration-300 px-3 py-2"
              type="text"
              placeholder="Your name"
              maxLength="100"
              required
              onChange={(e) =>
                setUserInput({ ...userInput, name: e.target.value })
              }
              onBlur={checkRequired}
              value={userInput.name}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-base">
              Email
            </label>
            <input
              id="email"
              className="bg-[#10172d] w-full border rounded-md border-[#353a52] focus:border-[#16f2b3] ring-0 outline-0 transition-all duration-300 px-3 py-2"
              type="email"
              placeholder="your.email@example.com"
              maxLength="100"
              required
              value={userInput.email}
              onChange={(e) =>
                setUserInput({ ...userInput, email: e.target.value })
              }
              onBlur={() => {
                checkRequired();
                setError({ ...error, email: !isValidEmail(userInput.email) });
              }}
            />
            {error.email && (
              <p className="text-sm text-red-400">
                Please enter a valid email address
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-base">
              Message
            </label>
            <textarea
              id="message"
              className="bg-[#10172d] w-full border rounded-md border-[#353a52] focus:border-[#16f2b3] ring-0 outline-0 transition-all duration-300 px-3 py-2"
              placeholder="What would you like to discuss?"
              maxLength="500"
              required
              onChange={(e) =>
                setUserInput({ ...userInput, message: e.target.value })
              }
              onBlur={checkRequired}
              rows="4"
              value={userInput.message}
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            {error.required && (
              <p className="text-sm text-red-400">
                Please fill in all fields to send your message
              </p>
            )}
            <button
              type="submit"
              className="flex items-center gap-1 hover:gap-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 md:px-12 py-2.5 md:py-3 text-center text-xs md:text-sm font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:text-white hover:no-underline md:font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Sending...</span>
              ) : (
                <span className="flex items-center gap-1">
                  Send Message
                  <TbMailForward size={20} />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
