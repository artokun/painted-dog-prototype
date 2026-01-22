"use client";

import { ThreeLink } from "./ThreeLink";
import { PDButton } from "./ui/PDButton";
import { PDInput } from "./ui/PDInput";
import { PDTextarea } from "./ui/PDTextarea";
import { useForm } from "react-hook-form";
import { useState, useTransition, useRef, useEffect } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { submitSubmissionForm } from "@/app/actions/submission";
import { cn } from "@/lib/utils";
import { ArrowRight } from "./icons/ArrowRight";
import { animated, useSpring } from "@react-spring/web";
import { Footer } from "./Footer";
import { useMediaQuery } from "usehooks-ts";
import ReCaptcha from "./ReCaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { globalStore } from "../store/globalStore";

enum Tab {
  General = "general",
  Submission = "submission",
}

export const ContactPageContent = ({ visible }: { visible: boolean }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [tab, setTab] = useState(Tab.General);
  const [showContent, setShowContent] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset success state when component becomes visible after being hidden
  useEffect(() => {
    if (visible && !wasVisible && isSuccess) {
      setIsSuccess(false);
      setTab(Tab.General); // Also reset to general tab
    }
    setWasVisible(visible);
  }, [visible, wasVisible, isSuccess]);

  // Track scroll position and smooth scroll to top on navigation away
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visible) {
        globalStore.overlayScrollPosition = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll);

    // Smooth scroll to top when navigating away
    if (!visible && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      globalStore.overlayScrollPosition = 0;
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  const style = useSpring({
    opacity: visible ? 1 : 0,
    x: visible ? 0 : 100,
    delay: visible ? 300 : 50,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);
    },
  });

  return (
    <animated.div
      ref={containerRef}
      id="contact-page-scroll-container"
      style={style}
      className={cn(
        "absolute inset-0 h-dvh w-dvw text-black z-10 overflow-y-auto overflow-x-hidden",
        visible && "pointer-events-auto"
      )}
    >
      {showContent && (
        <>
          <div
            className={cn(
              "flex flex-col items-center justify-center max-w-3xl mx-auto w-full mt-20 md:px-2 px-8"
            )}
          >
            {isSuccess ? (
              <SuccessMessage onReset={() => setIsSuccess(false)} />
            ) : (
              <ContactPage
                onSuccess={() => setIsSuccess(true)}
                tab={tab}
                setTab={setTab}
              />
            )}
          </div>
          <Footer />
        </>
      )}
    </animated.div>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <li
      className="h-10 flex items-center justify-end cursor-pointer relative"
      onClick={onClick}
    >
      <span
        className={cn(
          "transition-all duration-300 hover:-translate-x-1",
          active && "font-medium -translate-x-7 hover:-translate-x-7"
        )}
      >
        {children}
      </span>
      <ArrowRight
        className={cn(
          "h-6 w-6 absolute right-0 transition-all -translate-x-2 duration-100 delay-0 opacity-0",
          active && "translate-x-0 opacity-100 delay-100 duration-300"
        )}
      />
    </li>
  );
};

const FormSelector = ({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormSelect = (selectedTab: Tab) => {
    setTab(selectedTab);
    setIsOpen(false);
  };

  const styles = useSpring({
    height: isOpen ? "auto" : 48, // 48px for the main button (py-3 = 12px top + 12px bottom + ~24px content)
    config: { duration: 150 },
  });

  const getDisplayText = () => {
    return tab === Tab.General ? "General form" : "Submission form";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <animated.div
        style={styles}
        className={cn(
          "flex flex-col rounded-sm border border-black font-medium cursor-pointer transition-all duration-100 overflow-hidden",
          "hover:translate-y-[-2px] hover:shadow-md",
          isOpen && "shadow-md translate-y-[-2px]"
        )}
      >
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-left"
        >
          <span>{getDisplayText()}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={cn(
              "transition-transform duration-300 ease-in-out",
              isOpen && "rotate-180"
            )}
          >
            <path
              fill="none"
              stroke="black"
              strokeWidth="1"
              d="M3 5l3 3 3-3"
            />
          </svg>
        </div>
        {isOpen && (
          <div className="flex flex-col font-normal w-full border-t border-black">
            <button
              onClick={() => handleFormSelect(Tab.General)}
              className={cn(
                "w-full px-4 py-2 text-left cursor-pointer hover:font-medium active:text-neutral-900",
                tab === Tab.General && "font-medium"
              )}
            >
              General form
            </button>
            <button
              onClick={() => handleFormSelect(Tab.Submission)}
              className={cn(
                "w-full px-4 py-2 text-left cursor-pointer hover:font-medium active:text-neutral-900",
                tab === Tab.Submission && "font-medium"
              )}
            >
              Submission form
            </button>
          </div>
        )}
      </animated.div>
    </div>
  );
};


const ContactPage = ({
  onSuccess,
  tab,
  setTab,
}: {
  onSuccess: () => void;
  tab: Tab;
  setTab: (tab: Tab) => void;
}) => {
  return (
    <div className="md:py-20 py-12">
      <h1 className="text-center md:text-5xl text-4xl font-medium md:py-20 py-12">
        Contact
      </h1>
      <p className="mx-auto max-w-md text-center md:leading-loose px-2">
        Whether you are an aspiring writer, a reviewer, an influencer, or you
        have discovered interesting reviews of our works in publications or on
        BookTok we&apos;d love to hear from you. Select a form type to begin.
      </p>
      <div className="md:hidden w-full py-12 flex flex-col gap-2">
        <label className="text-md font-medium">Select form</label>
        <FormSelector tab={tab} setTab={setTab} />
      </div>
      <div className="flex gap-[100px] w-full md:py-20">
        <aside className="hidden md:flex flex-col items-end gap-4 flex-0 min-w-[224px] border-r border-black pr-8 h-fit sticky top-[80px]">
          <h3 className="text-3xl">Form Type</h3>
          <ul className="flex flex-col gap-2">
            <TabButton
              active={tab === Tab.General}
              onClick={() => setTab(Tab.General)}
            >
              General form
            </TabButton>
            <TabButton
              active={tab === Tab.Submission}
              onClick={() => setTab(Tab.Submission)}
            >
              Submission form
            </TabButton>
          </ul>
        </aside>
        <section className="flex-1">
          {tab === Tab.General && <GeneralForm onSuccess={onSuccess} />}
          {tab === Tab.Submission && <SubmissionForm onSuccess={onSuccess} />}
        </section>
      </div>
      <div className="border-b border-black w-full max-w-[400px] mx-auto h-[1px] pt-20 md:pt-3" />
      <div className="flex gap-[100px] w-full md:py-20 pt-18">
        <aside className="hidden md:flex flex-col items-end gap-4 flex-0 min-w-[224px] pr-8 h-fit">
          <h3 className="text-3xl font-medium">Email us</h3>
        </aside>
        <section className="flex-1">
          <h3 className="text-3xl font-medium mb-6 md:hidden">Email us</h3>
          If you have any further concerns, please reach out to us at{" "}
          <ThreeLink href="mailto:info@painteddog.press" target="_blank">
            info@painteddog.press
          </ThreeLink>
        </section>
      </div>
    </div>
  );
};

interface SubmissionFormData {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  submissionType: string;
  submittedToAnotherPublisher: string;
  file: FileList;
  consent: boolean;
  newsletter: boolean;
}

const SubmissionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isPending, startTransition] = useTransition();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string>("");
  const [serverError, setServerError] = useState<string>("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const fileInputRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubmissionFormData>();

  // Scroll to file input error when file validation fails
  useEffect(() => {
    if (errors.file && fileInputRef.current) {
      fileInputRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [errors.file]);

  const onSubmit = (data: SubmissionFormData) => {
    // Clear previous errors
    setRecaptchaError("");
    setServerError("");

    // Check if reCAPTCHA is completed
    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA verification");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("firstName", data.firstName);
        formData.append("surname", data.surname);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("submissionType", data.submissionType);
        formData.append(
          "submittedToAnotherPublisher",
          data.submittedToAnotherPublisher
        );
        if (data.file && data.file[0]) {
          formData.append("file", data.file[0]);
        }
        formData.append("consent", data.consent ? "on" : "");
        formData.append("newsletter", data.newsletter ? "on" : "");
        formData.append("recaptchaToken", recaptchaToken);

        const result = await submitSubmissionForm(formData);
        
        // Handle newsletter subscription if present
        if (result.newsletterSubscription && result.newsletterSubscription.redirectUrl) {
          window.open(result.newsletterSubscription.redirectUrl, '_blank', 'noopener,noreferrer');
        }
        
        onSuccess();
        reset();
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      } catch (error) {
        console.error("Form submission error:", error);
        
        // Handle different types of errors gracefully
        if (error instanceof Error) {
          // Check if it's a validation error or other server error
          const errorMessage = error.message;
          
          // Handle specific validation errors
          if (errorMessage.includes("phone") || errorMessage.includes("Phone")) {
            setServerError("Please check your phone number format and try again.");
          } else if (errorMessage.includes("email") || errorMessage.includes("Email")) {
            setServerError("Please check your email address and try again.");
          } else if (errorMessage.includes("file") || errorMessage.includes("File")) {
            setServerError("There was an issue with your file upload. Please check the file size and format.");
          } else if (errorMessage.includes("reCAPTCHA") || errorMessage.includes("recaptcha")) {
            setRecaptchaError(errorMessage);
          } else {
            // Generic server error
            setServerError(errorMessage || "Something went wrong. Please try again.");
          }
        } else {
          setServerError("An unexpected error occurred. Please try again.");
        }
        
        // Reset reCAPTCHA on error
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      }
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    setRecaptchaError("");
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setRecaptchaError("reCAPTCHA has expired. Please verify again.");
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setRecaptchaError("reCAPTCHA error occurred. Please try again.");
  };
  return (
    <div className="flex flex-col gap-4">
      <p>We welcome submissions in the following categories:</p>
      <ul className="list-disc pl-6">
        <li>
          <strong>Fiction:</strong> Novels, graphic novels, short story
          collections and novellas
        </li>
        <li>
          <strong>Non-fiction:</strong> Memoirs, biographies, essays and
          narrative non-fiction
        </li>
      </ul>
      <p>
        Manuscripts can be submitted electronically in a Word or PDF format.
        Include a brief biography, a synopsis of your work and any relevant
        publishing history.
      </p>
      <form className="flex flex-col gap-9" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-md font-medium mb-4">
            Personal Information
          </legend>
          <div className="border-b border-black pb-1">
            <PDInput
              label="First Name*"
              noUnderline
              required
              type="text"
              placeholder="Enter first name"
              {...register("firstName", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters",
                },
                pattern: {
                  value: /^[a-zA-ZÀ-ÿĀ-žА-я\s\-']+$/,
                  message:
                    "First name can only contain letters, spaces, hyphens, and apostrophes",
                },
              })}
            />
            {errors.firstName && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.firstName.message}
              </span>
            )}
          </div>
          <div className="border-b border-black pb-1">
            <PDInput
              label="Surname*"
              noUnderline
              required
              type="text"
              placeholder="Enter surname"
              {...register("surname", {
                required: "Surname is required",
                minLength: {
                  value: 2,
                  message: "Surname must be at least 2 characters",
                },
                pattern: {
                  value: /^[a-zA-ZÀ-ÿĀ-žА-я\s\-']+$/,
                  message:
                    "Surname can only contain letters, spaces, hyphens, and apostrophes",
                },
              })}
            />
            {errors.surname && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.surname.message}
              </span>
            )}
          </div>
          <div className="border-b border-black pb-1">
            <PDInput
              label="Email*"
              noUnderline
              required
              type="email"
              placeholder="Enter email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="border-b border-black pb-1">
            <PDInput
              label="Phone Number*"
              noUnderline
              type="tel"
              placeholder="Enter phone number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[\+]?[\d\s\-\(\)\.]{10,20}$/,
                  message: "Please enter a valid phone number (10-20 characters)",
                },
              })}
            />
            {errors.phone && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.phone.message}
              </span>
            )}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-md font-medium mb-4">
            Submission Details
          </legend>
          <div className="border-b border-black pb-1">
            <PDInput
              label="Submission Type"
              noUnderline
              type="select"
              placeholder="Select"
              options={[
                { value: "fiction", label: "Fiction" },
                { value: "non-fiction", label: "Non-fiction" },
              ]}
              {...register("submissionType", {
                required: "Submission type is required",
              })}
            />
            {errors.submissionType && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.submissionType.message}
              </span>
            )}
          </div>
          <div className="border-b border-black pb-1">
            <PDInput
              label="Have you submitted this proposal to another publisher?"
              noUnderline
              type="select"
              placeholder="Select"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              {...register("submittedToAnotherPublisher", {
                required: "This field is required",
              })}
            />
            {errors.submittedToAnotherPublisher && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.submittedToAnotherPublisher.message}
              </span>
            )}
          </div>
          <div ref={fileInputRef}>
            <PDInput
              label="Your file*"
              noUnderline
              multiple
              type="file"
              accept=".doc,.docx,.pdf"
              placeholder="Maximum file size: 4.5MB"
              {...register("file", {
                required: "Please upload your manuscript",
                validate: {
                  size: (files) => {
                    if (!files || !files[0]) return true;
                    return (
                      files[0].size <= 4.5 * 1024 * 1024 ||
                      "File size must be less than 4.5MB"
                    );
                  },
                  type: (files) => {
                    if (!files || !files[0]) return true;
                    const validTypes = [
                      "application/pdf",
                      "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ];
                    return (
                      validTypes.includes(files[0].type) ||
                      "Please upload a PDF or Word document"
                    );
                  },
                },
              })}
            />
            {errors.file && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.file.message}
              </span>
            )}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <PDInput
            id="consent_terms_submission"
            type="checkbox"
            {...register("consent", {
              required: "You must agree to the terms to continue",
            })}
          >
            <span>
              {" "}
              I consent to the{" "}
              <ThreeLink href="/legal#use-of-personal-information">
                terms of submission.
              </ThreeLink>
            </span>
          </PDInput>
          {errors.consent && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.consent.message}
            </span>
          )}
          <PDInput
            id="newsletter_submission"
            type="checkbox"
            {...register("newsletter")}
          >
            <span>
              Join the newsletter to receive updates.
              <br />
              <small className="text-sm block leading-tight mt-1">
                By ticking this box, you agree to our POPI policy.{" "}
                <ThreeLink href="/legal#privacy-data-collection">
                  Read it here
                </ThreeLink>
                .
              </small>
            </span>
          </PDInput>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <ReCaptcha
            ref={recaptchaRef}
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
            onError={handleRecaptchaError}
            theme="light"
            size="normal"
          />
          {recaptchaError && (
            <span className="text-red-500 text-sm">{recaptchaError}</span>
          )}
          {serverError && (
            <span className="text-red-500 text-sm font-medium">{serverError}</span>
          )}
        </fieldset>
        <p>
          We aim to respond to all submissions within three to six months. If
          you have not heard from us within this timeframe, please feel free to
          follow up.
        </p>
        <fieldset className="flex">
          <PDButton
            primary
            wide
            type="submit"
            disabled={isPending}
            className={cn(isPending && "opacity-50 cursor-not-allowed")}
          >
            {isPending ? "Submitting..." : "Submit"}
          </PDButton>
        </fieldset>
      </form>
    </div>
  );
};

const SuccessMessage = ({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col gap-3 text-center p-6">
    <h3 className="text-5xl font-medium">Thank you</h3>
    <p className="mt-20">
      Your form has been submitted.
      <br />
      Thanks for reaching out.
    </p>
    <div className="flex flex-col max-w-3xs w-full mx-auto gap-3 mt-8">
      <PDButton primary tall href="/">
        Back to home
      </PDButton>
      <PDButton onClick={onReset} tall>
        Send another message
      </PDButton>
    </div>
  </div>
);

interface ContactFormData {
  firstName: string;
  surname: string;
  email: string;
  message: string;
  consent: boolean;
  newsletter: boolean;
}

const GeneralForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isPending, startTransition] = useTransition();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string>("");
  const [serverError, setServerError] = useState<string>("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = (data: ContactFormData) => {
    // Clear previous errors
    setRecaptchaError("");
    setServerError("");

    // Check if reCAPTCHA is completed
    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA verification");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("firstName", data.firstName);
        formData.append("surname", data.surname);
        formData.append("email", data.email);
        formData.append("message", data.message);
        formData.append("consent", data.consent ? "on" : "");
        formData.append("newsletter", data.newsletter ? "on" : "");
        formData.append("recaptchaToken", recaptchaToken);

        const result = await submitContactForm(formData);
        
        // Handle newsletter subscription if present
        if (result.newsletterSubscription && result.newsletterSubscription.redirectUrl) {
          window.open(result.newsletterSubscription.redirectUrl, '_blank', 'noopener,noreferrer');
        }
        
        onSuccess();
        reset();
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      } catch (error) {
        console.error("Form submission error:", error);
        
        // Handle different types of errors gracefully
        if (error instanceof Error) {
          // Check if it's a validation error or other server error
          const errorMessage = error.message;
          
          // Handle specific validation errors
          if (errorMessage.includes("email") || errorMessage.includes("Email")) {
            setServerError("Please check your email address and try again.");
          } else if (errorMessage.includes("reCAPTCHA") || errorMessage.includes("recaptcha")) {
            setRecaptchaError(errorMessage);
          } else {
            // Generic server error
            setServerError(errorMessage || "Something went wrong. Please try again.");
          }
        } else {
          setServerError("An unexpected error occurred. Please try again.");
        }
        
        // Reset reCAPTCHA on error
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      }
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    setRecaptchaError("");
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setRecaptchaError("reCAPTCHA has expired. Please verify again.");
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setRecaptchaError("reCAPTCHA error occurred. Please try again.");
  };

  return (
    <form className="flex flex-col gap-9" onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-md font-medium mb-4">
          Personal Information
        </legend>
        <div className="border-b border-black pb-1">
          <PDInput
            label="First Name*"
            noUnderline
            required
            type="text"
            placeholder="Enter first name"
            {...register("firstName", {
              required: "First name is required",
              minLength: {
                value: 2,
                message: "First name must be at least 2 characters",
              },
              pattern: {
                value: /^[a-zA-ZÀ-ÿĀ-žА-я\s\-']+$/,
                message:
                  "First name can only contain letters, spaces, hyphens, and apostrophes",
              },
            })}
          />
          {errors.firstName && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.firstName.message}
            </span>
          )}
        </div>
        <div className="border-b border-black pb-1">
          <PDInput
            label="Surname*"
            noUnderline
            required
            type="text"
            placeholder="Enter surname"
            {...register("surname", {
              required: "Surname is required",
              minLength: {
                value: 2,
                message: "Surname must be at least 2 characters",
              },
              pattern: {
                value: /^[a-zA-ZÀ-ÿĀ-žА-я\s\-']+$/,
                message:
                  "Surname can only contain letters, spaces, hyphens, and apostrophes",
              },
            })}
          />
          {errors.surname && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.surname.message}
            </span>
          )}
        </div>
        <div className="border-b border-black pb-1">
          <PDInput
            label="Email*"
            noUnderline
            required
            type="email"
            placeholder="Enter email address"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.email.message}
            </span>
          )}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-md font-medium mb-4">Message</legend>
        <PDTextarea
          required
          placeholder="Type your message here."
          {...register("message", {
            required: "Message is required",
          })}
        />
        {errors.message && (
          <span className="text-red-500 text-sm mt-1 block">
            {errors.message.message}
          </span>
        )}
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <PDInput
          id="consent_terms"
          required
          type="checkbox"
          {...register("consent", {
            required: "You must agree to the terms to continue",
          })}
        >
          <span>
            I consent to the{" "}
            <ThreeLink href="/legal#use-of-personal-information">
              terms of submission
            </ThreeLink>
            .
          </span>
        </PDInput>
        {errors.consent && (
          <span className="text-red-500 text-sm mt-1 block">
            {errors.consent.message}
          </span>
        )}
        <PDInput id="newsletter" type="checkbox" {...register("newsletter")}>
          <span>
            Join the newsletter to receive updates.
            <br />
            <small className="text-sm block leading-tight mt-1">
              By ticking this box, you agree to our POPI policy.{" "}
              <ThreeLink href="/legal#privacy-data-collection">
                Read it here
              </ThreeLink>
              .
            </small>
          </span>
        </PDInput>
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <ReCaptcha
          ref={recaptchaRef}
          onChange={handleRecaptchaChange}
          onExpired={handleRecaptchaExpired}
          onError={handleRecaptchaError}
          theme="light"
          size="normal"
        />
        {recaptchaError && (
          <span className="text-red-500 text-sm">{recaptchaError}</span>
        )}
        {serverError && (
          <span className="text-red-500 text-sm font-medium">{serverError}</span>
        )}
      </fieldset>
      <fieldset className="flex">
        <PDButton
          primary
          wide
          type="submit"
          tall={isMobile}
          disabled={isPending}
          className={cn(
            "w-full md:w-fit",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPending ? "Submitting..." : "Submit form"}
        </PDButton>
      </fieldset>
    </form>
  );
};
