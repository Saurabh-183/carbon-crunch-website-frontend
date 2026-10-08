import { useState } from "react";
import Button from "../../ui/Button";

export default function ContactFormSection() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      setFormData({ name: "", phone: "", email: "", company: "", message: "" });
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <section className="relative z-20 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto -mt-[80px] min-h-[600px] w-full max-w-[781px] rounded-[24px] border border-bark-900/10 bg-[#ececec] px-6 py-8 shadow-[0_10px_24px_rgba(0,0,0,0.10)] sm:-mt-[120px] sm:rounded-[30px] sm:px-8 sm:py-10 md:px-10">
        <h2 className="font-display text-[36px] font-medium leading-tight text-bark-900 sm:text-[44px]">Contact Us</h2>

        {status === "success" ? (
          <div className="mt-10 text-center py-16">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-display text-[28px] font-semibold text-bark-900">Message Sent!</h3>
            <p className="mt-3 text-[16px] text-bark-900/70">Thank you for reaching out. Our team will get back to you shortly.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 inline-flex h-[44px] items-center rounded-full bg-bark-900 px-8 text-[14px] font-semibold text-white hover:bg-black transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-x-12 gap-y-5 sm:grid-cols-2" aria-label="Contact form">
            <label className="text-[16px] text-bark-900/75">
              Full Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 h-10 w-full border-b border-bark-900/45 bg-transparent text-[16px] text-bark-900 outline-none"
                required
              />
            </label>
            <label className="text-[16px] text-bark-900/75">
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-2 h-10 w-full border-b border-bark-900/45 bg-transparent text-[16px] text-bark-900 outline-none"
                required
              />
            </label>
            <label className="text-[16px] text-bark-900/75">
              Email Address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 h-10 w-full border-b border-bark-900/45 bg-transparent text-[16px] text-bark-900 outline-none"
                required
              />
            </label>
            <label className="text-[16px] text-bark-900/75">
              Company Name
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="mt-2 h-10 w-full border-b border-bark-900/45 bg-transparent text-[16px] text-bark-900 outline-none"
              />
            </label>
            <label className="sm:col-span-2 text-[16px] text-bark-900/75">
              Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="mt-2 w-full resize-none border-b border-bark-900/45 bg-transparent py-2 text-[16px] text-bark-900 outline-none"
                required
              />
            </label>

            {status === "error" && <div className="sm:col-span-2 text-center text-red-600 text-[14px] font-medium">{errorMsg}</div>}

            <div className="sm:col-span-2 mt-3 flex justify-center">
              <Button type="submit" className="min-w-[170px] justify-center px-8" showIcon={false} disabled={status === "loading"}>
                {status === "loading" ? "Submitting..." : "Submit Form"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
