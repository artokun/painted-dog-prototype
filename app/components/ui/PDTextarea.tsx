type PDTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  placeholder: string;
};

export const PDTextarea = ({ ...props }: PDTextareaProps) => {
  return (
    <textarea
      rows={6}
      className="border border-black rounded-sm py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0 bg-transparent autofill:bg-transparent autofill:text-black autofill:shadow-[inset_0_0_0px_1000px_transparent] text-[#1A1A1A] placeholder:text-[#1A1A1A] placeholder:opacity-40 scroll-m-0"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          // Only prevent form submission if it's a plain Enter (not Shift+Enter, etc.)
          // But still allow the Enter to work in the textarea for new lines
          e.stopPropagation();
        }
      }}
      onFocus={(e) => {
        e.preventDefault();
        const currentScrollPos = e.target.parentElement?.parentElement?.parentElement?.scrollTop;
        if (currentScrollPos !== undefined) {
          requestAnimationFrame(() => {
            e.target.parentElement?.parentElement?.parentElement?.scrollTo({ top: currentScrollPos });
          });
        }
      }}
      {...props}
    />
  );
};