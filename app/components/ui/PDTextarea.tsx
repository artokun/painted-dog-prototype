type PDTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  placeholder: string;
};

export const PDTextarea = ({ ...props }: PDTextareaProps) => {
  return (
    <textarea
      rows={6}
      className="border border-black rounded-sm py-2 pl-2 h-8 flex-1 focus:outline-none focus:ring-0"
      {...props}
    />
  );
};