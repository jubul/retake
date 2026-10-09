export function FormErrors({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <ul role="alert" className="border-[3px] border-pink bg-white p-3 text-sm font-bold">
      {errors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
