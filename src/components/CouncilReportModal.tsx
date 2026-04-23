import { X } from 'lucide-react';

interface CouncilReportModalProps {
  text: string;
  onDismiss: () => void;
}

export function CouncilReportModal({ text, onDismiss }: CouncilReportModalProps) {
  return (
    <>
      <div className="fixed inset-0 overlay-blur-strong z-[120] animate-fade-in" onClick={onDismiss} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[130] max-w-md mx-auto animate-scale-in">
        <div
          className="rounded-[1.75rem] p-6 shadow-2xl border"
          style={{
            background:
              'linear-gradient(160deg, hsl(38 50% 92%), hsl(32 40% 84%))',
            borderColor: 'hsl(32 30% 70%)',
            color: 'hsl(28 35% 22%)',
          }}
        >
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="text-4xl mb-2">🧙‍♂️</div>
            <h2 className="text-xl font-bold mb-3">The Council Has Spoken 📜</h2>
          </div>

          <p
            className="text-sm leading-relaxed font-serif italic"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {text}
          </p>

          <button
            onClick={onDismiss}
            className="mt-5 w-full py-3 rounded-2xl font-semibold text-white"
            style={{ background: 'hsl(28 60% 35%)' }}
          >
            Noted, Elders
          </button>
        </div>
      </div>
    </>
  );
}
