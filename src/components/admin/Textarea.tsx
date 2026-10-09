import type { TextareaHTMLAttributes } from 'react';
import { controlClass } from './Input';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  return <textarea className={controlClass(invalid, className)} {...rest} />;
}
