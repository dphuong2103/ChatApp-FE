export const generateClassName = (styles: CSSModuleClasses, classNames: string[]) => {
  let concatClassNames = '';
  if (classNames.length <= 0) return '';
  classNames.forEach((className) => (concatClassNames += ` ${styles[className]}`));
  return concatClassNames;
};
