import { MessageCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const WHATSAPP_URL = 'https://wa.me/5565984320031';

const WhatsAppButton = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fale Conosco pelo WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 whatsapp-pulse"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      </TooltipTrigger>
      <TooltipContent side="left">Fale Conosco</TooltipContent>
    </Tooltip>
  );
};

export default WhatsAppButton;
