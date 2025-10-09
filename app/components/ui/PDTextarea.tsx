type PDTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  placeholder: string;
};

export const PDTextarea = ({ ...props }: PDTextareaProps) => {
  return (
    <textarea
      rows={6}
      className="border border-black rounded-sm py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40"
      {...props}
    />
  );
};