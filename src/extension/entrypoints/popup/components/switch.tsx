import { Component, JSX } from 'solid-js';
import { cn } from '../utils/cn';
import styles from './switch.module.css';

export interface SwitchProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  children?: JSX.Element;
}

export const Switch: Component<SwitchProps> = (props) => {
  return (
    <label
      class={cn(
        styles.wrapper,
        styles['wrapper--ios'],
        props.disabled && styles['wrapper--disabled'],
      )}
    >
      <input type="checkbox" class={cn(styles.input, styles.hidden)} {...props} />
      <div aria-hidden class={styles.control} />
      {props.children}
    </label>
  );
};
