import { useState } from 'react';
import TicketForm from '@/components/TicketForm';
import TicketWall from '@/components/TicketWall';
import MobileTicketForm from '@/components/MobileTicketForm';
import { PlusIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import Navbar from '@/components/Navbar';
import PencilWallBackground from '@/components/PencilWallBackground';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-sans min-h-screen pencil-wall-bg">
      <PencilWallBackground />
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:grid md:grid-cols-12 md:gap-8">
        {/* Ticket Form - Desktop */}
        <section className="md:col-span-4 lg:col-span-3 mb-8 md:mb-0 hidden md:block">
          <TicketForm />
        </section>

        {/* Ticket Wall */}
        <section className="md:col-span-8 lg:col-span-9">
          <TicketWall />
        </section>
      </main>

      {/* Mobile ticket creation button */}
      <div className="fixed bottom-4 right-4 md:hidden z-10">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="minimal-btn-primary p-3 rounded-full shadow-lg"
                aria-label="Raise It!"
              >
                <PlusIcon className="h-6 w-6" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content 
                className="z-50 overflow-hidden rounded-sm bg-slate-900 px-3 py-1.5 text-xs text-white animate-fade-in"
                side="top"
                sideOffset={5}
              >
                Raise It!
                <Tooltip.Arrow className="fill-slate-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      {/* Mobile Ticket Form Dialog */}
      <MobileTicketForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
