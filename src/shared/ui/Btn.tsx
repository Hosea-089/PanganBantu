/*
=============================
Btn
--> Tombol aksi atau tautan navigasi dengan kontrak props TypeScript terpisah.
=============================
*/

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type CommonProps = {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'white';
  className?: string;
};
type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never };
type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

export function Btn(props: ButtonProps | LinkProps) {
  if (props.to !== undefined) {
    const { to, variant = 'primary', className = '', children, ...rest } = props;
    return (
      <a href={`#${to}`} className={`btn ${variant} ${className}`} {...rest}>
        {children}
      </a>
    );
  }
  const {
    to: _to,
    variant = 'primary',
    className = '',
    children,
    type = 'button',
    ...rest
  } = props;
  return (
    <button type={type} className={`btn ${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}
