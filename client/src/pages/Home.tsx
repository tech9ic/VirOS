import { useState } from 'react';
import TicketForm from '@/components/TicketForm';
import TicketWall from '@/components/TicketWall';
import MobileTicketForm from '@/components/MobileTicketForm';
import { PlusIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-medium text-neutral-dark">Ticket Wall</h1>
          
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="minimal-btn-primary p-2 md:hidden"
                  aria-label="Create new ticket"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="z-50 overflow-hidden rounded-sm bg-slate-900 px-3 py-1.5 text-xs text-white animate-fade-in"
                  side="bottom"
                  sideOffset={5}
                >
                  Create ticket
                  <Tooltip.Arrow className="fill-slate-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </header>

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

      {/* Mobile Ticket Form Dialog */}
      <MobileTicketForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
