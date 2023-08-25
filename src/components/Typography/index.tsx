import { ReactNode } from 'react';
import styles from '@styles.module.scss';
import { generateClassName } from '@helper/generateClassName';
interface TitleTextProps {
  size?: 'xl' | 'l' | 'm' | 's' | 'xs';
  color?: 'title' | 'subtitle' | 'text';
  weight?: string | number;
  children: ReactNode;
}

interface RegularTextProps {
  size?: 'l' | 'm' | 's';
  color?: 'text' | 'subtitle' | 'label';
  weight?: string | number;
  children: ReactNode;
}

export function TitleText({ size, color, weight, children }: TitleTextProps) {
  const classNames = [`colors-base-${color ?? 'title'}`,
  `text-sizes-title-title-${size ?? 'm'}`,
    `fonts-title`,
  ];

  return <h1 className={generateClassName(styles, classNames)} style={{
    fontWeight: weight ?? 800,
    lineHeight: '130%',
  }} >{children}</h1>;
}


export function RegularText({ size, color, weight, children }: RegularTextProps) {
  const classNames = [`colors-base-${color ?? 'text'}`, `text-sizes-text-regular-${size ?? 'm'}`];
  return <p className={generateClassName(styles, classNames)} style={{
    lineHeight: '130%',
    fontWeight: weight ?? 400
  }}>{children}</p>
}