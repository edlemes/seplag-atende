import { useState, useEffect } from 'react';
import { Sun, Moon, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type FontSize = 'default' | 'lg' | 'xl';
type Theme = 'light' | 'dark' | 'high-contrast';

const AccessibilityBar = () => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('a11y-font-size') as FontSize) || 'default';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('a11y-theme') as Theme) || 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('font-size-lg', 'font-size-xl');
    if (fontSize !== 'default') html.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('a11y-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'high-contrast');
    if (theme === 'dark') html.classList.add('dark');
    if (theme === 'high-contrast') html.classList.add('high-contrast');
    localStorage.setItem('a11y-theme', theme);
  }, [theme]);

  const increaseFontSize = () => {
    setFontSize((prev) => prev === 'default' ? 'lg' : prev === 'lg' ? 'xl' : 'xl');
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => prev === 'xl' ? 'lg' : prev === 'lg' ? 'default' : 'default');
  };

  const toggleDarkMode = () => {
    setTheme((prev) => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleHighContrast = () => {
    setTheme((prev) => prev === 'high-contrast' ? 'light' : 'high-contrast');
  };

  return (
    <div className="bg-foreground/95 text-background px-4 py-1.5 flex items-center justify-end gap-1 text-xs" role="toolbar" aria-label="Barra de acessibilidade">
      <span className="mr-2 font-medium hidden sm:inline">Acessibilidade:</span>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-background hover:bg-background/20"
            onClick={decreaseFontSize}
            aria-label="Diminuir fonte"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Diminuir fonte</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-background hover:bg-background/20"
            onClick={increaseFontSize}
            aria-label="Aumentar fonte"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Aumentar fonte</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-background hover:bg-background/20"
            onClick={toggleDarkMode}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 hover:bg-background/20 ${theme === 'high-contrast' ? 'bg-background/30 text-background' : 'text-background'}`}
            onClick={toggleHighContrast}
            aria-label="Alto contraste"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Alto contraste</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default AccessibilityBar;
