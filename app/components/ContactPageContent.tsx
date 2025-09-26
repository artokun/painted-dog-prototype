"use client";

import { ThreeLink } from "./ThreeLink";
import { PDButton } from "./ui/PDButton";
import { PDInput } from "./ui/PDInput";

export const ContactPageContent = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto w-full mt-20 px-4">
      <h1 className="text-5xl font-medium py-20">Contact</h1>
      <p className="max-w-md text-center leading-loose px-2">
        Whether you are an aspiring writer, a reviewer, an influencer, or you
        have discovered interesting reviews of our works in publications or on
        BookTok we’d love to hear from you.{" "}
      </p>
      <div className="flex gap-[100px] w-full py-20">
        <aside className="flex flex-col items-end gap-4 flex-0 min-w-[224px] border-r border-black pr-8 h-fit">
          <h3 className="text-3xl">Form Type</h3>
          <ul className="flex flex-col gap-2 [&>li]:h-10 [&>li]:flex [&>li]:items-center [&>li]:justify-end [&>li]:cursor-pointer">
            <li>General form</li>
            <li>Submission form</li>
          </ul>
        </aside>
        <section className="flex-1">
          <GeneralForm />
        </section>
      </div>
      <div className="border-b border-black w-full max-w-[400px] mx-auto h-[1px] pb-3" />
      <div className="flex gap-[100px] w-full py-20">
        <aside className="flex flex-col items-end gap-4 flex-0 min-w-[224px] pr-8 h-fit">
          <h3 className="text-3xl font-medium">Email us</h3>
        </aside>
        <section className="flex-1">
          <p className="flex flex-col items-start">
            <span>
              If you have any further concerns, please reach out to us at
            </span>
            <ThreeLink href="mailto:info@painteddogpress.com">
              info@painteddogpress.com
            </ThreeLink>
          </p>
        </section>
      </div>
    </div>
  );
};

type PDTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  placeholder: string;
};

const PDTextarea = ({ ...props }: PDTextareaProps) => {
  return (
    <textarea
      rows={6}
      className="border border-black rounded-sm py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0"
      {...props}
    />
  );
};

const GeneralForm = () => {
  return (
    <form className="flex flex-col gap-9">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-lg font-medium mb-4">
          Personal Information
        </legend>
        <div className="border-b border-black pb-1">
          <PDInput
            label="First Name*"
            required
            noUnderline
            type="text"
            placeholder="Enter first name"
          />
        </div>
        <div className="border-b border-black pb-1">
          <PDInput
            label="Surname*"
            required
            noUnderline
            type="text"
            placeholder="Enter surname"
          />
        </div>
        <div className="border-b border-black pb-1">
          <PDInput
            label="Email*"
            required
            noUnderline
            type="email"
            placeholder="Enter email"
          />
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-lg font-medium mb-4">Message</legend>
        <PDTextarea placeholder="Type your message here." />
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <PDInput id="consent_terms" required type="checkbox">
          <span>
            I consent to the{" "}
            <ThreeLink href="/terms">terms of submission</ThreeLink>.
          </span>
        </PDInput>
        <PDInput id="newsletter" type="checkbox">
          <span>
            Join the newsletter to receive updates.
            <br />
            <small className="text-sm block leading-tight mt-1">
              By ticking this box, you agree to our POPI policy.
              <br />
              <ThreeLink href="/legal">Read it here</ThreeLink>.
            </small>
          </span>
        </PDInput>
      </fieldset>
      <fieldset className="flex">
        <PDButton primary wide type="submit">
          Submit form
        </PDButton>
      </fieldset>
    </form>
  );
};
