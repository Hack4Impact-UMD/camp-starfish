import { useState } from "react";
import flag from "../assets/icons/flag.svg";
import errorIcon from "../assets/icons/error.svg";

interface PhotoReportingProps {
  onClose: () => void;
}

export default function PhotoReporting({ onClose }: PhotoReportingProps) {
  const [submitted, setSubmitted] = useState(true);

  // If submitted, but database didn't properly update, then error would be set to true
  const [error, setError] = useState(true);

  const [reportMessage, setReportMessage] = useState("");
  

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };


  return (
    <>
      {!submitted && (
        <form
          onSubmit={handleSubmit}
          className="w-[576px] h-[440px] flex flex-col justify-center items-center px-[56px] py-[40px] gap-[24px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
        >
          <h1 className="font-bold text-[28px]">Report a photo</h1>
          <p>We will share your issue with the team for review</p>
          <textarea
            className="bg-[#E6EAEC] w-full h-[160px] px-[24px] py-[16px] rounded-[8px] placeholder:text-camp-text-subheadings text-camp-text-subheadings resize-none"
            placeholder="Describe your issue"
            onChange = {(e) => setReportMessage(e.target.value)}
          />
          <div className="w-full flex justify-center gap-[16px]">
            <button
              type="button"
              onClick={onClose}
              className="bg-camp-buttons-neutral text-camp-text-body w-[216px] h-[48px] rounded-[40px] font-bold text-[18px]"
            >
              CLOSE
            </button>
            <button
              type="submit"
              className="bg-camp-cta-primary text-white w-[216px] h-[48px] rounded-[40px] font-bold text-[18px]"
            >
              REPORT
            </button>
          </div>
        </form>
      )}

      {submitted && !error && (
        <div className="w-[576px] h-[320px] flex flex-col justify-center items-center px-[56px] py-[40px] gap-[20px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <img src={flag.src} alt="flag" />
          <h1 className="font-bold text-[28px]">Report sent!</h1>
          <p>Our team will review your issue and email you soon</p>
          <button
            onClick={onClose}
            className="bg-camp-buttons-neutral text-camp-text-body w-[216px] h-[48px] rounded-[40px] font-bold text-[18px]"
          >
            CLOSE
          </button>
        </div>
      )}

      {submitted && error && (
        <div className="w-[576px] h-[320px] flex flex-col justify-center items-center px-[56px] py-[40px] gap-[15px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <img src={errorIcon.src} alt="flag" />
          <h1 className="font-bold text-[28px]">Error Reporting</h1>
          <p>Please try again later or contact support</p>
          <div className = "flex gap-[20px]">
            <button
              onClick={onClose}
              className="bg-camp-buttons-neutral text-camp-text-body w-[200px] h-[56px] rounded-[40px] font-bold text-[18px]"
            >
              CLOSE
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-camp-primary text-white w-[200px] h-[56px] rounded-[40px] font-bold text-[18px]"
            >
              TRY AGAIN
            </button>      

          </div>
            
        </div>
      )}
    </>
  );
}
