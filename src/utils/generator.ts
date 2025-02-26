import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import { FONT_FAMILIES } from '@/config/generator.ts';

export const computeBackgroundStyle = (
  backgroundType: string,
  backgroundColor: string,
  gradientStart: string,
  gradientEnd: string,
  gradientAngle: number,
  backgroundImage: string,
  backgroundSize: 'cover' | 'contain',
  backgroundPosition: string
): React.CSSProperties => {
  switch (backgroundType) {
    case 'solid':
      return { backgroundColor };
    case 'gradient':
      return { backgroundImage: `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})` };
    case 'image':
      return {
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize,
        backgroundPosition,
        backgroundRepeat: 'no-repeat'
      };
    case 'transparent':
      return { backgroundColor: 'transparent' };
    default:
      return { backgroundColor };
  }
};

export const handleImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  setBackgroundImage: (image: string) => void
) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackgroundImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
};

export const exportImage = async (
  format: 'png' | 'jpeg' | 'webp' | 'avif',
  backgroundType: string,
  setIsExporting: (value: boolean) => void
) => {
  const element = document.getElementById('cover-preview');
  if (!element) return;

  try {
    setIsExporting(true);
    const options: any = {
      quality: 1,
      bgcolor: backgroundType === 'transparent' ? null : undefined
    };

    let blob;
    switch (format) {
      case 'png':
        blob = await domtoimage.toBlob(element, options);
        break;
      case 'jpeg':
        blob = await domtoimage.toJpeg(element, options);
        break;
      case 'webp':
      case 'avif':
        blob = await domtoimage.toPng(element, options);
        break;
    }

    if (blob) {
      saveAs(blob, `cover.${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    setIsExporting(false);
  }
};

export const loadWebFont = async () => {
  await loadExternalResource(
    'https://chinese-fonts-cdn.deno.dev/packages/lxgwwenkaibright/dist/LXGWBright-Medium/result.css',
    'css'
  );
  FONT_FAMILIES.forEach(({ url }) => url && loadExternalResource(url, 'css'));
};

export const loadExternalResource = (url: string, type = 'js') => {
  // 检查是否已存在
  const elements =
    type === 'js' ? document.querySelectorAll(`[src='${url}']`) : document.querySelectorAll(`[href='${url}']`);
  return new Promise((resolve, reject) => {
    if (elements.length > 0 || !url) {
      resolve(url);
      return url;
    }
    let tag;
    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    } else if (type === 'font') {
      tag = document.createElement('link');
      tag.rel = 'preload';
      tag.as = 'font';
      tag.href = url;
    } else if (type === 'js') {
      tag = document.createElement('script');
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => {
        // console.log('Load Success', url)
        resolve(url);
      };
      tag.onerror = () => {
        console.warn('Load Error', url);
        reject(url);
      };
      document.head.appendChild(tag);
    }
  });
};