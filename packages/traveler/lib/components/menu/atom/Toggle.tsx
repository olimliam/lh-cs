import cx from 'classnames';

function Toggle(props: {
  className?: string;
  value?: boolean;
  size?: 'sm' | 'md';
  onChecked?: (isChecked: boolean) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChecked) {
      props.onChecked(e.target.checked);
    }
  };

  return (
    <input
      type='checkbox'
      className={cx(
        'v2-toggle',
        `toggle-${props.size || 'sm'}`,
        props.className
      )}
      checked={props.value}
      onChange={(e) => handleChange(e)}
    />
  );
}

export default Toggle;
