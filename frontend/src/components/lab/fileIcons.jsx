import { DiJavascript1, DiHtml5, DiCss3, DiReact, DiPython, DiRust } from 'react-icons/di';
import { SiTypescript, SiJson, SiMarkdown, SiSvg } from 'react-icons/si';
import { VscFile } from 'react-icons/vsc';

const iconMap = {
  js:   { icon: DiJavascript1, color: '#F7DF1E' },
  jsx:  { icon: DiReact,       color: '#61DAFB' },
  ts:   { icon: SiTypescript,  color: '#3178C6' },
  tsx:  { icon: DiReact,       color: '#61DAFB' },
  html: { icon: DiHtml5,       color: '#E34F26' },
  css:  { icon: DiCss3,        color: '#1572B6' },
  json: { icon: SiJson,        color: '#A8B9CC' },
  md:   { icon: SiMarkdown,    color: '#FFFFFF' },
  svg:  { icon: SiSvg,         color: '#FFB13B' },
  py:   { icon: DiPython,      color: '#3776AB' },
  rs:   { icon: DiRust,        color: '#CE422B' },
};

export function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  return iconMap[ext] || { icon: VscFile, color: '#9CA3AF' };
}

export function FileIcon({ filename, size = 16, className = '' }) {
  const { icon: Icon, color } = getFileIcon(filename);
  return <Icon size={size} color={color} className={className} />;
}
